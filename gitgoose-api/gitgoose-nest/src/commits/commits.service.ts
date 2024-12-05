import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commit } from './entities/commit.entity';
import { CreateCommitInput } from './dto/create-commit.input';
import { GitClientService } from '../git-client/git-client.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class CommitsService {
  private readonly logger = new Logger(CommitsService.name);

  constructor(
    @InjectRepository(Commit)
    private commitRepository: Repository<Commit>,
    private gitClientService: GitClientService,
    private authService: AuthService,
  ) {}

  async create(createCommitInput: CreateCommitInput): Promise<Commit> {
    // Get the current branch's latest commit to use as parent
    const latestCommit = await this.gitClientService.getCommitHistory(
      createCommitInput.repositoryId,
      createCommitInput.branch,
    );

    // Create commit in Git
    const gitCommit = await this.gitClientService.createCommit({
      repoId: createCommitInput.repositoryId,
      message: createCommitInput.message,
      branch: createCommitInput.branch,
      authorId: createCommitInput.authorId,
      authorName: createCommitInput.authorName,
      authorEmail: createCommitInput.authorEmail,
      files: createCommitInput.files.map((file) => ({
        path: file.path,
        content: file.content,
        operation: file.operation,
      })),
    });

    // Create commit record in database
    const commit = this.commitRepository.create({
      sha: gitCommit.sha,
      message: gitCommit.message,
      authorName: gitCommit.author.name,
      authorEmail: gitCommit.author.email,
      authorId: createCommitInput.authorId,
      repositoryId: createCommitInput.repositoryId,
      parentShas: latestCommit.length > 0 ? [latestCommit[0].sha] : [], // Use the latest commit as parent
      isMergeCommit: false,
    });

    return await this.commitRepository.save(commit);
  }

  async findAll(): Promise<Commit[]> {
    return await this.commitRepository.find({
      relations: ['author', 'repository'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Commit> {
    const commit = await this.commitRepository.findOne({
      where: { id },
      relations: ['author', 'repository'],
    });

    if (!commit) {
      throw new NotFoundException(`Commit with ID ${id} not found`);
    }

    return commit;
  }

  async findByRepository(repositoryId: string): Promise<Commit[]> {
    return await this.commitRepository.find({
      where: { repositoryId },
      relations: ['author', 'repository'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySha(repositoryId: string, sha: string): Promise<Commit> {
    const commit = await this.commitRepository.findOne({
      where: { repositoryId, sha },
      relations: ['author', 'repository'],
    });

    if (!commit) {
      throw new NotFoundException(
        `Commit with SHA ${sha} not found in repository ${repositoryId}`,
      );
    }

    return commit;
  }

  async findByAuthor(authorId: string): Promise<Commit[]> {
    return await this.commitRepository.find({
      where: { authorId },
      relations: ['repository'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByBranch(
    repositoryId: string,
    branchName: string,
  ): Promise<Commit[]> {
    // Get commit SHAs for the branch from Git
    const gitCommits = await this.gitClientService.getCommitHistory(
      repositoryId,
      branchName,
    );

    const shas = gitCommits.map((commit) => commit.sha);

    // Fetch commits from database in the correct order
    return await this.commitRepository
      .createQueryBuilder('commit')
      .where('commit.repositoryId = :repositoryId', { repositoryId })
      .andWhere('commit.sha IN (:...shas)', { shas })
      .leftJoinAndSelect('commit.author', 'author')
      .leftJoinAndSelect('commit.repository', 'repository')
      .orderBy(
        `ARRAY_POSITION(ARRAY[${shas.map((sha) => `'${sha}'`).join(',')}]::text[], commit.sha::text)`,
      )
      .getMany();
  }

  async findLatest(repositoryId: string, branchName?: string): Promise<Commit> {
    const commits = await this.findByBranch(repositoryId, branchName || 'main');

    return commits[0];
  }

  async createCommit(commit: Partial<Commit>): Promise<Commit> {
    const newCommit = this.commitRepository.create(commit);
    return await this.commitRepository.save(newCommit);
  }
}
