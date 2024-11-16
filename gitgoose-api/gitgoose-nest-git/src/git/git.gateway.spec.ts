import { Test, TestingModule } from '@nestjs/testing';
import { GitGateway } from './git.gateway';
import { GitService } from './git.service';
import { RemoteOperationDto } from './dto/remote-operation.dto';

describe('GitGateway', () => {
  let gateway: GitGateway;

  const mockGitService = {
    initRepo: jest.fn(),
    createCommit: jest.fn(),
    createBranch: jest.fn(),
    getBranches: jest.fn(),
    handleFileOperation: jest.fn(),
    getCommitHistory: jest.fn(),
    cloneRepo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitGateway,
        {
          provide: GitService,
          useValue: mockGitService,
        },
      ],
    }).compile();

    gateway = module.get<GitGateway>(GitGateway);
  });

  describe('handleInitRepo', () => {
    it('should initialize a repository', async () => {
      const repoId = 'test-repo';
      const repoPath = '/path/to/repo';

      mockGitService.initRepo.mockResolvedValue(repoPath);

      const result = await gateway.handleInitRepo(repoId);

      expect(result).toBe(repoPath);
      expect(mockGitService.initRepo).toHaveBeenCalledWith(repoId);
    });
  });

  describe('handleCommit', () => {
    it('should create a commit', async () => {
      const dto = {
        repoId: 'test-repo',
        message: 'test commit',
        authorId: 'user1',
        authorName: 'Test User',
        files: [],
      };

      const commitResult = {
        sha: 'test-sha',
        message: dto.message,
        author: {
          name: dto.authorName,
          email: 'test@example.com',
        },
        timestamp: Date.now(),
      };

      mockGitService.createCommit.mockResolvedValue(commitResult);

      const result = await gateway.handleCommit(dto);

      expect(result).toEqual(commitResult);
      expect(mockGitService.createCommit).toHaveBeenCalledWith(dto);
    });
  });

  describe('handleFileOperation', () => {
    it('should handle file operations', async () => {
      const dto = {
        repoId: 'test-repo',
        operation: 'read' as const,
        path: 'test.txt',
      };

      const operationResult = { content: 'file content' };
      mockGitService.handleFileOperation.mockResolvedValue(operationResult);

      const result = await gateway.handleFileOperation(dto);

      expect(result).toEqual(operationResult);
      expect(mockGitService.handleFileOperation).toHaveBeenCalledWith(dto);
    });
  });

  describe('handleCloneRepo', () => {
    it('should clone a repository', async () => {
      const dto: RemoteOperationDto = {
        repoId: 'test-repo',
        url: 'https://github.com/test/repo.git',
        branch: 'main',
        auth: {
          username: 'testuser',
          password: 'testpass',
        },
      };

      const repoPath = '/path/to/cloned/repo';
      mockGitService.cloneRepo.mockResolvedValue(repoPath);

      const result = await gateway.handleCloneRepo(dto);

      expect(result).toBe(repoPath);
      expect(mockGitService.cloneRepo).toHaveBeenCalledWith(dto);
    });

    it('should handle clone failure', async () => {
      const dto: RemoteOperationDto = {
        repoId: 'test-repo',
        url: 'https://github.com/test/repo.git',
        branch: 'main',
      };

      mockGitService.cloneRepo.mockRejectedValue(new Error('Clone failed'));

      await expect(gateway.handleCloneRepo(dto)).rejects.toThrow(
        'Clone failed',
      );
    });
  });
});
