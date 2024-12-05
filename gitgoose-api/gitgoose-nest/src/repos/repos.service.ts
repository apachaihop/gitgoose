import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRepoInput } from './dto/create-repo.input';
import { UpdateRepoInput } from './dto/update-repo.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repo } from './entities/repo.entity';
import { GitClientService } from '../git-client/git-client.service';
import { UploadFilesInput } from '../git-client/dto/upload-files.dto';
import { Commit } from '../commits/entities/commit.entity';
import { Branch } from '../branches/entities/branch.entity';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType } from '../activities/enums/activity-type.enum';
import { User } from '../auth/entities/user.entity';
import { RepoCollaborator } from './entities/repo_collaborator.entity';
import { LanguageAnalyzerService } from './language-analyzer.service';
import { LanguageStats } from './entities/language-stats.entity';

@Injectable()
export class ReposService {
  constructor(
    @InjectRepository(Repo)
    private repoRepository: Repository<Repo>,
    @InjectRepository(RepoCollaborator)
    private repoCollaboratorRepository: Repository<RepoCollaborator>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    @InjectRepository(Commit)
    private commitRepository: Repository<Commit>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private gitClientService: GitClientService,
    private activitiesService: ActivitiesService,
    private readonly languageAnalyzerService: LanguageAnalyzerService,
    @InjectRepository(LanguageStats)
    private languageStatsRepository: Repository<LanguageStats>,
  ) {}

  async create(createRepoInput: CreateRepoInput) {
    let savedRepo: Repo;

    // Start a transaction
    savedRepo = await this.repoRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const repo = this.repoRepository.create({
          ...createRepoInput,
          path: `${createRepoInput.ownerId}/${createRepoInput.name}`.toLowerCase(),
        });

        try {
          // Save the repository first using the transaction manager
          const newRepo = await transactionalEntityManager.save(repo);

          const ownerName = (
            await this.userRepository.findOne({
              where: { id: createRepoInput.ownerId },
            })
          ).username;
          const remoteUrl = `http://localhost:3000/git/${ownerName}/${createRepoInput.name}.git`;

          await this.gitClientService.initRepo(newRepo.id, remoteUrl);

          // Create initial commit with README.md
          const commit = await this.gitClientService.createCommit({
            repoId: newRepo.id,
            message: 'Initial commit',
            branch: createRepoInput.defaultBranch || 'main',
            authorId: newRepo.ownerId,
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

          // Create branch record using the transaction manager
          const branch = this.branchRepository.create({
            name: createRepoInput.defaultBranch || 'main',
            lastCommitSha: commit.sha,
            lastCommitMessage: commit.message,
            lastCommitAuthorId: newRepo.ownerId,
            isProtected: true,
            repositoryId: newRepo.id,
          });

          await transactionalEntityManager.save(branch);

          return newRepo;
        } catch (error) {
          throw new Error(`Failed to initialize repository: ${error.message}`);
        }
      },
    );

    // Create activity after transaction is complete
    if (savedRepo) {
      await this.activitiesService.createActivity({
        userId: createRepoInput.ownerId,
        type: ActivityType.REPO_CREATE,
        description: `Created repository ${savedRepo.name}`,
        repositoryId: savedRepo.id,
      });

      // Analyze languages after initial commit
      await this.updateLanguageStats(savedRepo.id);
    }

    return this.findOne(savedRepo.id);
  }

  async findAll() {
    return await this.repoRepository.find({
      relations: ['owner', 'languageStatsEntities'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const repo = await this.repoRepository.findOne({
      where: { id },
      relations: ['owner', 'languageStatsEntities'],
    });

    if (!repo) {
      throw new NotFoundException(`Repository with ID ${id} not found`);
    }

    return repo;
  }

  async update(id: string, updateRepoInput: UpdateRepoInput) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...updateData } = updateRepoInput;
    await this.repoRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string) {
    const repo = await this.repoRepository.findOne({
      where: { id },
      relations: [
        'branches',
        'languageStatsEntities',
        'commits',
        'issues',
        'pullRequests',
        'collaborators',
      ],
    });

    if (!repo) {
      throw new Error('Repository not found');
    }

    // Delete related entities first
    if (repo.branches?.length) {
      await this.branchRepository.remove(repo.branches);
    }
    if (repo.languageStatsEntities?.length) {
      await this.languageStatsRepository.remove(repo.languageStatsEntities);
    }
    if (repo.collaborators?.length) {
      await this.repoCollaboratorRepository.remove(repo.collaborators);
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

      return this.findOne(savedRepo.id);
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

    // Return URL in format: git/username/repo-name.git
    return `http://localhost:3000/git/${repo.owner.username}/${repo.name}.git`;
  }

  async findByPath(path: string): Promise<Repo> {
    // First try to find by exact path
    let repo = await this.repoRepository.findOne({
      where: { path },
      relations: [
        'owner',
        'branches',
        'commits',
        'issues',
        'pullRequests',
        'languageStatsEntities',
      ],
    });

    if (!repo) {
      // If not found, try to find by username/repo-name
      const [ownerName, repoName] = path.split('/');
      // Find the user by username
      const owner = await this.userRepository.findOne({
        where: { username: ownerName },
      });
      if (owner) {
        // Try to find the repo using userId/repoName format
        repo = await this.repoRepository.findOne({
          where: { path: `${owner.id}/${repoName.toLowerCase()}` },
          relations: [
            'owner',
            'branches',
            'commits',
            'issues',
            'pullRequests',
            'languageStatsEntities',
          ],
        });
      }
    }

    if (!repo) {
      throw new NotFoundException(`Repository ${path} not found`);
    }

    return repo;
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

  async findByOwner(ownerId: string): Promise<Repo[]> {
    return await this.repoRepository.find({
      where: { ownerId },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async setVisibility(id: string, isPrivate: boolean): Promise<Repo> {
    const repo = await this.findOne(id);
    repo.isPrivate = isPrivate;
    return await this.repoRepository.save(repo);
  }

  async setDefaultBranch(id: string, branchName: string): Promise<Repo> {
    const repo = await this.findOne(id);
    repo.defaultBranch = branchName;
    return await this.repoRepository.save(repo);
  }

  async checkPermission(
    repoId: string,
    userId: string,
    permission: string,
  ): Promise<boolean> {
    const repo = await this.repoRepository.findOne({
      where: { id: repoId },
      relations: ['collaborators'],
    });

    if (!repo) {
      return false;
    }

    // Owner has all permissions
    if (repo.ownerId === userId) {
      return true;
    }

    // Check collaborator permissions
    const collaborator = repo.collaborators?.find((c) => c.userId === userId);
    if (!collaborator) {
      return false;
    }

    switch (permission) {
      case 'read':
        return true;
      case 'write':
        return ['write', 'admin'].includes(collaborator.permission);
      case 'admin':
        return collaborator.permission === 'admin';
      default:
        return false;
    }
  }

  async getCollaborators(repositoryId: string): Promise<User[]> {
    const collaborators = await this.repoCollaboratorRepository
      .createQueryBuilder('collaborator')
      .leftJoinAndSelect('collaborator.user', 'user')
      .where('collaborator.repositoryId = :repositoryId', { repositoryId })
      .getMany();

    return collaborators.map((collab) => collab.user);
  }

  async findByUsername(username: string): Promise<Repo[]> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }

    return await this.repoRepository.find({
      where: { ownerId: user.id },
      relations: ['owner', 'languageStatsEntities'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getLanguageStats(id: string): Promise<LanguageStats[]> {
    const repo = await this.repoRepository.findOne({
      where: { id },
      relations: ['languageStatsEntities'],
    });

    if (!repo) {
      throw new NotFoundException(`Repository with ID ${id} not found`);
    }

    // If no language stats exist yet, analyze them
    if (!repo.languageStatsEntities?.length) {
      const updatedRepo = await this.updateLanguageStats(id);
      return updatedRepo.languageStatsEntities;
    }

    return repo.languageStatsEntities;
  }

  async updateLanguageStats(id: string): Promise<Repo> {
    return await this.repoRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const repo = await transactionalEntityManager.findOne(Repo, {
          where: { id },
          relations: ['languageStatsEntities'],
        });

        if (!repo) {
          throw new NotFoundException(`Repository with ID ${id} not found`);
        }

        const languageBytes =
          await this.languageAnalyzerService.analyzeRepository(
            id,
            repo.defaultBranch,
          );

        // Calculate total bytes
        const totalBytes = Object.values(languageBytes).reduce(
          (a, b) => a + b,
          0,
        );

        // Delete existing language stats
        if (repo.languageStatsEntities?.length) {
          await transactionalEntityManager.delete(LanguageStats, {
            repositoryId: id,
          });
        }

        if (totalBytes === 0) {
          repo.languageStatsEntities = [];
          repo.primaryLanguage = null;
          return await transactionalEntityManager.save(repo);
        }

        // Create new language stats entries
        const languageStatsEntities = await Promise.all(
          Object.entries(languageBytes).map(async ([language, bytes]) => {
            const percentage = Number(((bytes / totalBytes) * 100).toFixed(1));
            const languageStats = transactionalEntityManager.create(
              LanguageStats,
              {
                repositoryId: id,
                language,
                bytes: Math.floor(bytes),
                percentage,
                repository: repo,
              },
            );
            return await transactionalEntityManager.save(
              LanguageStats,
              languageStats,
            );
          }),
        );

        repo.languageStatsEntities = languageStatsEntities;
        repo.primaryLanguage = languageStatsEntities.sort(
          (a, b) => b.percentage - a.percentage,
        )[0]?.language;

        return await transactionalEntityManager.save(repo);
      },
    );
  }
}
