import { Test, TestingModule } from '@nestjs/testing';
import { GitService } from './git.service';
import { StorageService } from '../storage/storage.service';
import * as git from 'isomorphic-git';
import * as fs from 'fs';
import http from 'isomorphic-git/http/node';
import { RemoteOperationDto } from './dto/remote-operation.dto';

jest.mock('isomorphic-git');
jest.mock('fs');
jest.mock('isomorphic-git/http/node');

describe('GitService', () => {
  let service: GitService;

  const mockStorageService = {
    ensureRepoDirectory: jest.fn(),
    getRepoPath: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    deleteFile: jest.fn(),
    getFS: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitService,
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<GitService>(GitService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('initRepo', () => {
    it('should initialize a new repository with main branch', async () => {
      const repoId = 'test-repo';
      const repoPath = '/path/to/repo';
      const treeOid = 'test-tree-sha';
      const commitSha = 'test-commit-sha';

      mockStorageService.ensureRepoDirectory.mockResolvedValue(repoPath);
      (git.init as jest.Mock).mockResolvedValue(undefined);
      (git.writeTree as jest.Mock).mockResolvedValue(treeOid);
      (git.commit as jest.Mock).mockResolvedValue(commitSha);
      (git.writeRef as jest.Mock).mockResolvedValue(undefined);

      const result = await service.initRepo(repoId);

      expect(result).toBe(repoPath);
      expect(mockStorageService.ensureRepoDirectory).toHaveBeenCalledWith(
        repoId,
      );
      expect(git.init).toHaveBeenCalledWith({ fs, dir: repoPath });
      expect(git.writeTree).toHaveBeenCalledWith({
        fs,
        dir: repoPath,
        tree: [],
      });
      expect(git.commit).toHaveBeenCalledWith({
        fs,
        dir: repoPath,
        message: 'Initial commit',
        author: {
          name: 'System',
          email: 'system@gitgoose.com',
        },
        tree: treeOid,
      });
      expect(git.writeRef).toHaveBeenCalledWith(
        expect.objectContaining({
          fs,
          dir: repoPath,
          ref: 'refs/heads/main',
          value: commitSha,
        }),
      );
      expect(git.writeRef).toHaveBeenCalledWith(
        expect.objectContaining({
          fs,
          dir: repoPath,
          ref: 'HEAD',
          value: 'ref: refs/heads/main',
          force: true,
          symbolic: true,
        }),
      );
    });

    it('should throw error when initialization fails', async () => {
      const repoId = 'test-repo';
      const error = new Error('Init failed');

      mockStorageService.ensureRepoDirectory.mockRejectedValue(error);

      await expect(service.initRepo(repoId)).rejects.toThrow('Init failed');
    });
  });

  describe('createCommit', () => {
    it('should create a commit with files', async () => {
      const dto = {
        repoId: 'test-repo',
        message: 'test commit',
        branch: 'main',
        authorId: 'user1',
        authorName: 'Test User',
        authorEmail: 'test@example.com',
        files: [{ path: 'test.txt', content: 'test content' }],
      };

      const repoPath = '/path/to/repo';
      const commitSha = 'test-sha';

      mockStorageService.getRepoPath.mockResolvedValue(repoPath);
      (git.listBranches as jest.Mock).mockResolvedValue(['main']);
      (git.checkout as jest.Mock).mockResolvedValue(undefined);
      (git.add as jest.Mock).mockResolvedValue(undefined);
      (git.commit as jest.Mock).mockResolvedValue(commitSha);

      const result = await service.createCommit(dto);

      expect(result.sha).toBe(commitSha);
      expect(result.message).toBe(dto.message);
      expect(result.author.name).toBe(dto.authorName);
      expect(result.author.email).toBe(dto.authorEmail);
      expect(mockStorageService.writeFile).toHaveBeenCalledWith(
        dto.repoId,
        dto.files[0].path,
        dto.files[0].content,
      );
      expect(git.checkout).toHaveBeenCalledWith({
        fs,
        dir: repoPath,
        ref: dto.branch,
        force: true,
      });
    });

    it('should throw error when commit fails', async () => {
      const dto = {
        repoId: 'test-repo',
        message: 'test commit',
        authorId: 'user1',
        authorName: 'Test User',
        files: [],
      };

      mockStorageService.getRepoPath.mockRejectedValue(
        new Error('Failed to create commit: Commit failed'),
      );

      await expect(service.createCommit(dto)).rejects.toThrow(
        'Failed to create commit: Commit failed',
      );
    });
  });

  describe('handleFileOperation', () => {
    const repoPath = '/path/to/repo';

    beforeEach(() => {
      mockStorageService.getRepoPath.mockResolvedValue(repoPath);
    });

    it('should read file content', async () => {
      const dto = {
        repoId: 'test-repo',
        operation: 'read' as const,
        path: 'test.txt',
        branch: 'main',
      };

      const content = 'file content';
      mockStorageService.readFile.mockResolvedValue(content);
      (git.checkout as jest.Mock).mockResolvedValue(undefined);

      const result = await service.handleFileOperation(dto);

      expect(result.content).toBe(content);
      expect(mockStorageService.readFile).toHaveBeenCalledWith(
        dto.repoId,
        dto.path,
      );
      expect(git.checkout).toHaveBeenCalledWith({
        fs,
        dir: repoPath,
        ref: dto.branch,
        force: true,
      });
    });

    it('should write file content', async () => {
      const dto = {
        repoId: 'test-repo',
        operation: 'write' as const,
        path: 'test.txt',
        content: 'new content',
      };

      mockStorageService.writeFile.mockResolvedValue(undefined);

      const result = await service.handleFileOperation(dto);

      expect(result).toEqual({});
      expect(mockStorageService.writeFile).toHaveBeenCalledWith(
        dto.repoId,
        dto.path,
        dto.content,
      );
    });

    it('should delete file', async () => {
      const dto = {
        repoId: 'test-repo',
        operation: 'delete' as const,
        path: 'test.txt',
      };

      mockStorageService.deleteFile.mockResolvedValue(undefined);

      const result = await service.handleFileOperation(dto);

      expect(result).toEqual({});
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(
        dto.repoId,
        dto.path,
      );
    });

    it('should list files', async () => {
      const dto = {
        repoId: 'test-repo',
        operation: 'list' as const,
        path: '/',
        branch: 'main',
      };

      const files = ['file1.txt', 'file2.txt'];
      (git.listFiles as jest.Mock).mockResolvedValue(files);
      (git.checkout as jest.Mock).mockResolvedValue(undefined);

      const result = await service.handleFileOperation(dto);

      expect(result.files).toHaveLength(2);
      expect(result.files![0]).toEqual({
        path: 'file1.txt',
        type: 'file',
      });
      expect(git.checkout).toHaveBeenCalledWith({
        fs,
        dir: repoPath,
        ref: dto.branch || 'HEAD',
        force: true,
      });
      expect(git.listFiles).toHaveBeenCalledWith({
        fs,
        dir: repoPath,
        ref: dto.branch || 'HEAD',
      });
    });

    it('should throw error for unsupported operation', async () => {
      const dto = {
        repoId: 'test-repo',
        operation: 'invalid' as any,
        path: 'test.txt',
      };

      await expect(service.handleFileOperation(dto)).rejects.toThrow(
        'File operation failed: Unsupported operation: invalid',
      );
    });
  });

  describe('getBranches', () => {
    it('should return list of branches', async () => {
      const repoId = 'test-repo';
      const repoPath = '/path/to/repo';

      mockStorageService.getRepoPath.mockResolvedValue(repoPath);
      (git.listBranches as jest.Mock).mockResolvedValue(['main', 'develop']);
      (git.currentBranch as jest.Mock).mockResolvedValue('main');
      (git.resolveRef as jest.Mock)
        .mockResolvedValueOnce('sha1')
        .mockResolvedValueOnce('sha2');

      const result = await service.getBranches(repoId);

      expect(result).toEqual([
        { name: 'main', sha: 'sha1', isHead: true },
        { name: 'develop', sha: 'sha2', isHead: false },
      ]);
    });

    it('should handle errors when getting branches', async () => {
      const repoId = 'test-repo';
      mockStorageService.getRepoPath.mockRejectedValue(
        new Error('Failed to get branches: Repository not found'),
      );

      await expect(service.getBranches(repoId)).rejects.toThrow(
        'Failed to get branches: Repository not found',
      );
    });
  });

  describe('createBranch', () => {
    it('should create a new branch', async () => {
      const dto = {
        repoId: 'test-repo',
        name: 'feature',
        startPoint: 'main',
      };
      const repoPath = '/path/to/repo';

      mockStorageService.getRepoPath.mockResolvedValue(repoPath);
      (git.resolveRef as jest.Mock).mockResolvedValue('sha1');
      (git.branch as jest.Mock).mockResolvedValue(undefined);

      await service.createBranch(dto);

      expect(git.branch).toHaveBeenCalledWith({
        fs,
        dir: repoPath,
        ref: dto.name,
        checkout: true,
        object: 'sha1',
      });
    });

    it('should handle branch creation errors', async () => {
      const dto = {
        repoId: 'test-repo',
        name: 'feature',
        startPoint: 'main',
      };

      mockStorageService.getRepoPath.mockRejectedValue(
        new Error('Failed to create branch'),
      );

      await expect(service.createBranch(dto)).rejects.toThrow(
        'Failed to create branch',
      );
    });
  });

  describe('getCommitHistory', () => {
    it('should return commit history', async () => {
      const repoId = 'test-repo';
      const repoPath = '/path/to/repo';
      const mockCommits = [
        {
          oid: 'sha1',
          commit: {
            message: 'First commit',
            author: {
              name: 'Test User',
              email: 'test@example.com',
              timestamp: 1234567890,
            },
          },
        },
        {
          oid: 'sha2',
          commit: {
            message: 'Second commit',
            author: {
              name: 'Test User',
              email: 'test@example.com',
              timestamp: 1234567891,
            },
          },
        },
      ];

      mockStorageService.getRepoPath.mockResolvedValue(repoPath);
      (git.log as jest.Mock).mockResolvedValue(mockCommits);

      const result = await service.getCommitHistory(repoId);

      expect(result).toEqual(
        mockCommits.map((commit) => ({
          sha: commit.oid,
          message: commit.commit.message,
          author: {
            name: commit.commit.author.name,
            email: commit.commit.author.email,
          },
          timestamp: commit.commit.author.timestamp * 1000,
        })),
      );
    });

    it('should handle errors when getting commit history', async () => {
      const repoId = 'test-repo';
      mockStorageService.getRepoPath.mockRejectedValue(
        new Error('Failed to get commit history: Repository not found'),
      );

      await expect(service.getCommitHistory(repoId)).rejects.toThrow(
        'Failed to get commit history: Repository not found',
      );
    });
  });

  describe('merge', () => {
    it('should merge branches successfully', async () => {
      const dto = {
        repoId: 'test-repo',
        sourceBranch: 'feature',
        targetBranch: 'main',
        message: 'Merge feature into main',
        author: {
          name: 'Test User',
          email: 'test@example.com',
        },
      };
      const repoPath = '/path/to/repo';

      mockStorageService.getRepoPath.mockResolvedValue(repoPath);
      (git.checkout as jest.Mock).mockResolvedValue(undefined);
      (git.merge as jest.Mock).mockResolvedValue({ oid: 'merge-sha' });

      const result = await service.merge(dto);

      expect(result).toEqual({
        sha: 'merge-sha',
        message: dto.message,
        author: dto.author,
        timestamp: expect.any(Number),
      });

      // Verify checkout was called with target branch
      expect(git.checkout).toHaveBeenCalledWith({
        fs,
        dir: repoPath,
        ref: dto.targetBranch,
        force: true,
      });

      // Verify merge was called with correct parameters
      expect(git.merge).toHaveBeenCalledWith({
        fs,
        dir: repoPath,
        theirs: dto.sourceBranch,
        author: dto.author,
        message: dto.message,
      });
    });

    it('should handle merge conflicts', async () => {
      const dto = {
        repoId: 'test-repo',
        sourceBranch: 'feature',
        targetBranch: 'main',
        message: 'Merge feature into main',
        author: {
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      mockStorageService.getRepoPath.mockResolvedValue('/path/to/repo');
      (git.checkout as jest.Mock).mockResolvedValue(undefined);
      (git.merge as jest.Mock).mockRejectedValue(
        new Error('Merge conflict detected'),
      );

      await expect(service.merge(dto)).rejects.toThrow(
        'Failed to merge branches: Merge conflict detected',
      );
    });

    it('should handle repository not found error', async () => {
      const dto = {
        repoId: 'test-repo',
        sourceBranch: 'feature',
        targetBranch: 'main',
        message: 'Merge feature into main',
        author: {
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      mockStorageService.getRepoPath.mockRejectedValue(
        new Error('Failed to merge branches: Repository not found'),
      );

      await expect(service.merge(dto)).rejects.toThrow(
        'Failed to merge branches: Repository not found',
      );
    });
  });

  describe('cloneRepo', () => {
    const repoPath = '/path/to/repo';

    beforeEach(() => {
      mockStorageService.ensureRepoDirectory.mockResolvedValue(repoPath);
      mockStorageService.getRepoPath.mockResolvedValue(repoPath);
    });

    it('should clone a repository successfully', async () => {
      const dto: RemoteOperationDto = {
        repoId: 'test-repo',
        url: 'https://github.com/test/repo.git',
        branch: 'main',
        auth: {
          username: 'testuser',
          password: 'testpass',
        },
      };

      (git.clone as jest.Mock).mockResolvedValue(undefined);

      const result = await service.cloneRepo(dto);

      expect(result).toBe(repoPath);
      expect(mockStorageService.ensureRepoDirectory).toHaveBeenCalledWith(
        dto.repoId,
      );
      expect(git.clone).toHaveBeenCalledWith({
        fs,
        http,
        dir: repoPath,
        url: dto.url,
        ref: dto.branch || 'main',
        singleBranch: true,
        depth: 1,
        onAuth: expect.any(Function),
      });
    });

    it('should clone without authentication', async () => {
      const dto: RemoteOperationDto = {
        repoId: 'test-repo',
        url: 'https://github.com/test/public-repo.git',
        branch: 'main',
      };

      (git.clone as jest.Mock).mockResolvedValue(undefined);

      await service.cloneRepo(dto);

      expect(git.clone).toHaveBeenCalledWith({
        fs,
        http,
        dir: repoPath,
        url: dto.url,
        ref: dto.branch || 'main',
        singleBranch: true,
        depth: 1,
      });
    });

    it('should handle authentication correctly', async () => {
      const dto: RemoteOperationDto = {
        repoId: 'test-repo',
        url: 'https://github.com/test/repo.git',
        auth: {
          username: 'testuser',
          password: 'testpass',
        },
      };

      (git.clone as jest.Mock).mockImplementation(async ({ onAuth }) => {
        const auth = onAuth();
        expect(auth).toEqual({
          username: dto.auth.username,
          password: dto.auth.password,
        });
      });

      await service.cloneRepo(dto);
    });

    it('should handle clone failure', async () => {
      const dto: RemoteOperationDto = {
        repoId: 'test-repo',
        url: 'https://github.com/test/repo.git',
      };

      const error = new Error('Network error');
      (git.clone as jest.Mock).mockRejectedValue(error);

      await expect(service.cloneRepo(dto)).rejects.toThrow(
        'Failed to clone repository: Network error',
      );
    });

    it('should handle directory creation failure', async () => {
      const dto: RemoteOperationDto = {
        repoId: 'test-repo',
        url: 'https://github.com/test/repo.git',
      };

      mockStorageService.ensureRepoDirectory.mockRejectedValue(
        new Error('Failed to clone repository: Permission denied'),
      );

      await expect(service.cloneRepo(dto)).rejects.toThrow(
        'Failed to clone repository: Permission denied',
      );
    });
  });
});
