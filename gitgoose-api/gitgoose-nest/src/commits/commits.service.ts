import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commit } from './entities/commit.entity';
import { CreateCommitInput } from './dto/create-commit.input';
import { GitClientService } from '../git-client/git-client.service';

@Injectable()
export class CommitsService {
  constructor(
    @InjectRepository(Commit)
    private commitRepository: Repository<Commit>,
    private gitClientService: GitClientService,
  ) {}

  async create(createCommitInput: CreateCommitInput): Promise<Commit> {
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
      parentShas: [], // You might want to get this from the Git response
      isMergeCommit: false,
    });

    return await this.commitRepository.save(commit);
  }

  async findAll(): Promise<Commit[]> {
    return await this.commitRepository.find({
      relations: ['author', 'repository'],
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
    // Get commits from Git
    const gitCommits =
      await this.gitClientService.getCommitHistory(repositoryId);

    // Get commits from database
    const dbCommits = await this.commitRepository.find({
      where: { repositoryId },
      relations: ['author'],
    });

    for (const gitCommit of gitCommits as any[]) {
      const existingCommit = dbCommits.find((c) => c.sha === gitCommit.sha);
      if (!existingCommit) {
        const commit = this.commitRepository.create({
          sha: gitCommit.sha,
          message: gitCommit.message,
          authorName: gitCommit.author.name,
          authorEmail: gitCommit.author.email,
          repositoryId,
          parentShas: [],
          isMergeCommit: false,
        });
        await this.commitRepository.save(commit);
        dbCommits.push(commit);
      }
    }

    return dbCommits;
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
}
