import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommitsService } from './commits.service';
import { Commit } from './entities/commit.entity';
import { GitClientService } from '../git-client/git-client.service';
import { CreateCommitInput } from './dto/create-commit.input';
import { NotFoundException } from '@nestjs/common';

describe('CommitsService', () => {
  let service: CommitsService;
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
    createCommit: jest.fn(),
    getCommits: jest.fn(),
    getCommitHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommitsService,
        {
          provide: getRepositoryToken(Commit),
          useValue: mockRepository,
        },
        {
          provide: GitClientService,
          useValue: mockGitClientService,
        },
      ],
    }).compile();

    service = module.get<CommitsService>(CommitsService);
    gitClientService = module.get<GitClientService>(GitClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCommitInput: CreateCommitInput = {
      repositoryId: '1',
      message: 'test commit',
      branch: 'main',
      authorId: 'user1',
      authorName: 'Test User',
      authorEmail: 'test@example.com',
      files: [
        {
          path: 'test.txt',
          content: 'test content',
          operation: 'add',
        },
      ],
    };

    const mockGitCommit = {
      sha: 'test-sha',
      message: 'test commit',
      author: {
        name: 'Test User',
        email: 'test@example.com',
      },
      timestamp: Date.now(),
    };

    it('should create a commit', async () => {
      const mockCommit = {
        id: '1',
        sha: mockGitCommit.sha,
        message: createCommitInput.message,
        authorName: createCommitInput.authorName,
        authorEmail: createCommitInput.authorEmail,
        authorId: createCommitInput.authorId,
        repositoryId: createCommitInput.repositoryId,
        parentShas: [],
        isMergeCommit: false,
      };

      mockGitClientService.createCommit.mockResolvedValue(mockGitCommit);
      mockRepository.create.mockReturnValue(mockCommit);
      mockRepository.save.mockResolvedValue(mockCommit);

      const result = await service.create(createCommitInput);

      expect(result).toEqual(mockCommit);
      expect(mockGitClientService.createCommit).toHaveBeenCalledWith({
        repoId: createCommitInput.repositoryId,
        message: createCommitInput.message,
        branch: createCommitInput.branch,
        authorId: createCommitInput.authorId,
        authorName: createCommitInput.authorName,
        authorEmail: createCommitInput.authorEmail,
        files: createCommitInput.files,
      });
    });

    it('should handle git commit failure', async () => {
      mockGitClientService.createCommit.mockRejectedValue(
        new Error('Git commit failed'),
      );

      await expect(service.create(createCommitInput)).rejects.toThrow(
        'Git commit failed',
      );
    });
  });

  describe('findByRepository', () => {
    const repositoryId = '1';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockCommits = [
      {
        id: '1',
        sha: 'sha1',
        message: 'commit 1',
        authorName: 'Test User',
        authorEmail: 'test@example.com',
        repositoryId,
      },
      {
        id: '2',
        sha: 'sha2',
        message: 'commit 2',
        authorName: 'Test User',
        authorEmail: 'test@example.com',
        repositoryId,
      },
    ];

    it('should return commits for a repository', async () => {
      const mockGitCommits = [
        {
          sha: 'test-sha',
          message: 'test commit',
          author: {
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      ];

      const mockDbCommit = {
        id: '1',
        sha: 'test-sha',
        message: 'test commit',
        authorName: 'Test User',
        authorEmail: 'test@example.com',
        authorId: 'user1',
        repositoryId: '1',
        isMergeCommit: false,
        parentShas: [],
      };

      mockGitClientService.getCommitHistory.mockResolvedValue(mockGitCommits);
      mockRepository.find.mockResolvedValue([mockDbCommit]);

      const result = await service.findByRepository('1');
      expect(result).toEqual([mockDbCommit]);
      expect(mockGitClientService.getCommitHistory).toHaveBeenCalledWith('1');
    });
  });

  describe('findBySha', () => {
    it('should return a commit by SHA', async () => {
      const mockCommit = {
        id: '1',
        sha: 'test-sha',
        message: 'test commit',
        authorName: 'Test User',
        authorEmail: 'test@example.com',
        repositoryId: '1',
      };

      mockRepository.findOne.mockResolvedValue(mockCommit);

      const result = await service.findBySha('1', 'test-sha');
      expect(result).toEqual(mockCommit);
    });

    it('should throw NotFoundException when commit not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findBySha('1', 'invalid-sha')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
