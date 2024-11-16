import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRepoInput } from './dto/create-repo.input';
import { UpdateRepoInput } from './dto/update-repo.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repo } from './entities/repo.entity';
import { GitClientService } from '../git-client/git-client.service';
import { UploadFilesInput } from '../git-client/dto/upload-files.dto';
import { Commit } from '../commits/entities/commit.entity';

@Injectable()
export class ReposService {
  constructor(
    @InjectRepository(Repo)
    private repoRepository: Repository<Repo>,
    @InjectRepository(Commit)
    private commitRepository: Repository<Commit>,
    private gitClientService: GitClientService,
  ) {}

  async create(createRepoInput: CreateRepoInput) {
    const repo = this.repoRepository.create({
      ...createRepoInput,
      path: `${createRepoInput.ownerId}/${createRepoInput.name}`.toLowerCase(),
    });
    const savedRepo = await this.repoRepository.save(repo);

    // Initialize Git repository
    await this.gitClientService.initRepo(savedRepo.id);

    // Create initial commit with README.md
    await this.gitClientService.createCommit({
      repoId: savedRepo.id,
      message: 'Initial commit',
      branch: createRepoInput.defaultBranch || 'main',
      authorId: savedRepo.ownerId,
      authorName: 'System',
      authorEmail: 'system@gitgoose.com',
      files: [
        {
          path: 'README.md',
          content: `# ${createRepoInput.name}\n\n${createRepoInput.description || ''}`,
          operation: 'add',
        },
      ],
    });

    return savedRepo;
  }

  async findAll() {
    return await this.repoRepository.find();
  }

  async findOne(id: string) {
    return await this.repoRepository.findOne({ where: { id } });
  }

  async update(id: string, updateRepoInput: UpdateRepoInput) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...updateData } = updateRepoInput;
    await this.repoRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string) {
    const repo = await this.findOne(id);
    if (!repo) {
      throw new Error('Repository not found');
    }

    // Delete Git repository files (you might want to add this to GitClientService)
    //await this.gitClientService.deleteRepo(id);

    return await this.repoRepository.remove(repo);
  }

  async cloneRepository(input: {
    url: string;
    name: string;
    ownerId: string;
    description?: string;
    isPrivate?: boolean;
    auth?: { username: string; password: string };
  }): Promise<Repo> {
    // Create repository record
    const repo = this.repoRepository.create({
      name: input.name,
      description: input.description,
      ownerId: input.ownerId,
      isPrivate: input.isPrivate || false,
      path: `${input.ownerId}/${input.name}`.toLowerCase(),
    });

    const savedRepo = await this.repoRepository.save(repo);

    try {
      // Clone the repository
      await this.gitClientService.cloneRepo({
        repoId: savedRepo.id,
        url: input.url,
        auth: input.auth,
      });

      return savedRepo;
    } catch (error) {
      // Cleanup if clone fails
      await this.repoRepository.remove(savedRepo);
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }

  async getCloneUrl(id: string): Promise<string> {
    const repo = await this.findOne(id);
    if (!repo) {
      throw new NotFoundException('Repository not found');
    }

    // Returns URL in format: username/repo-name
    return `http://localhost:3000/git/${repo.path}.git`;
  }

  async findByPath(path: string): Promise<Repo> {
    return await this.repoRepository.findOne({
      where: { path },
    });
  }

  async uploadFiles(input: UploadFilesInput, userId: string): Promise<Commit> {
    const gitCommit = await this.gitClientService.uploadFiles(input, userId);

    // Create commit record in database
    const commit = this.commitRepository.create({
      sha: gitCommit.sha,
      message: gitCommit.message,
      authorName: gitCommit.author.name,
      authorEmail: gitCommit.author.email || 'system@gitgoose.com',
      authorId: userId,
      repositoryId: input.repositoryId,
      parentShas: [],
      isMergeCommit: false,
    });

    return await this.commitRepository.save(commit);
  }

  private async readFileStream(stream: any): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = '';
      stream.on('data', (chunk: any) => (data += chunk));
      stream.on('end', () => resolve(data));
      stream.on('error', reject);
    });
  }
}
