import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReposService } from './repos.service';
import { Repo } from './entities/repo.entity';
import { GitClientService } from '../git-client/git-client.service';
import { CreateRepoInput } from './dto/create-repo.input';
import { UpdateRepoInput } from './dto/update-repo.input';

describe('ReposService', () => {
  let service: ReposService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let gitClientService: GitClientService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockGitClientService = {
    initRepo: jest.fn(),
    createCommit: jest.fn(),
    deleteRepo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReposService,
        {
          provide: getRepositoryToken(Repo),
          useValue: mockRepository,
        },
        {
          provide: GitClientService,
          useValue: mockGitClientService,
        },
      ],
    }).compile();

    service = module.get<ReposService>(ReposService);
    gitClientService = module.get<GitClientService>(GitClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createRepoInput: CreateRepoInput = {
      name: 'test-repo',
      description: 'Test repository',
      defaultBranch: 'main',
      isPrivate: false,
    };

    const mockRepo = {
      id: '1',
      ownerId: 'user1',
      ...createRepoInput,
    };

    it('should create a repository with README', async () => {
      mockRepository.create.mockReturnValue(mockRepo);
      mockRepository.save.mockResolvedValue(mockRepo);
      mockGitClientService.initRepo.mockResolvedValue(undefined);
      mockGitClientService.createCommit.mockResolvedValue({
        sha: 'test-sha',
        message: 'Initial commit',
        author: {
          name: 'System',
          email: 'system@gitgoose.com',
        },
      });

      const result = await service.create(createRepoInput);

      expect(result).toEqual(mockRepo);
      expect(mockGitClientService.initRepo).toHaveBeenCalledWith(mockRepo.id);
      expect(mockGitClientService.createCommit).toHaveBeenCalledWith(
        expect.objectContaining({
          repoId: mockRepo.id,
          message: 'Initial commit',
          branch: 'main',
          files: [
            {
              path: 'README.md',
              content: expect.stringContaining(mockRepo.name),
              operation: 'add',
            },
          ],
        }),
      );
    });

    it('should handle git initialization failure', async () => {
      mockRepository.create.mockReturnValue(mockRepo);
      mockRepository.save.mockResolvedValue(mockRepo);
      mockGitClientService.initRepo.mockRejectedValue(
        new Error('Git init failed'),
      );

      await expect(service.create(createRepoInput)).rejects.toThrow(
        'Git init failed',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of repositories', async () => {
      const mockRepos = [
        { id: '1', name: 'repo1' },
        { id: '2', name: 'repo2' },
      ];
      mockRepository.find.mockResolvedValue(mockRepos);

      const result = await service.findAll();
      expect(result).toEqual(mockRepos);
    });
  });

  describe('findOne', () => {
    it('should return a repository by id', async () => {
      const mockRepo = { id: '1', name: 'repo1' };
      mockRepository.findOne.mockResolvedValue(mockRepo);

      const result = await service.findOne('1');
      expect(result).toEqual(mockRepo);
    });

    it('should return null if repository not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('999');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a repository', async () => {
      const updateRepoInput: UpdateRepoInput = {
        id: '1',
        name: 'updated-repo',
      };
      const updatedRepo = { id: '1', name: 'updated-repo' };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedRepo);

      const result = await service.update('1', updateRepoInput);
      expect(result).toEqual(updatedRepo);
    });
  });

  describe('remove', () => {
    it('should remove a repository', async () => {
      const mockRepo = { id: '1', name: 'repo1' };
      mockRepository.findOne.mockResolvedValue(mockRepo);
      mockRepository.remove.mockResolvedValue(mockRepo);

      const result = await service.remove('1');
      expect(result).toEqual(mockRepo);
    });

    it('should throw error if repository not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(
        'Repository not found',
      );
    });
  });
});
