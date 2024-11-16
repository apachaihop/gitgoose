import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as LightningFS from '@isomorphic-git/lightning-fs';

jest.mock('fs/promises');
jest.mock('path');
jest.mock('@isomorphic-git/lightning-fs');

describe('StorageService', () => {
  let service: StorageService;
  const mockBaseDir = '/test-repositories';

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock fs operations
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.chmod as jest.Mock).mockResolvedValue(undefined);
    (fs.rm as jest.Mock).mockResolvedValue(undefined);

    // Mock path operations
    (path.join as jest.Mock).mockImplementation((...paths) => paths.join('/'));

    // Mock LightningFS
    (LightningFS as unknown as jest.Mock).mockImplementation(() => ({
      promises: {
        mkdir: jest.fn(),
        writeFile: jest.fn(),
        readFile: jest.fn(),
        unlink: jest.fn(),
      },
    }));

    process.env.STORAGE_PATH = mockBaseDir;

    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    delete process.env.STORAGE_PATH;
  });

  describe('initializeStorage', () => {
    it('should create base directory if it does not exist', async () => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      await service['initializeStorage']();

      expect(fs.mkdir).toHaveBeenCalledWith(mockBaseDir, { recursive: true });
    });

    it('should ignore EEXIST error', async () => {
      const error = new Error('Directory exists');
      (error as any).code = 'EEXIST';
      (fs.mkdir as jest.Mock).mockRejectedValue(error);

      await expect(service['initializeStorage']()).resolves.not.toThrow();
    });
  });

  describe('getRepoPath', () => {
    it('should return correct repository path', async () => {
      const repoId = 'test-repo';
      const expectedPath = path.join(mockBaseDir, repoId);

      (path.join as jest.Mock).mockReturnValue(expectedPath);

      const result = await service.getRepoPath(repoId);
      expect(result).toBe(expectedPath);
    });
  });

  describe('ensureRepoDirectory', () => {
    it('should create and return repo directory path', async () => {
      const repoId = 'test-repo';
      const repoPath = path.join(mockBaseDir, repoId);

      (path.join as jest.Mock).mockReturnValue(repoPath);
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      const result = await service.ensureRepoDirectory(repoId);

      expect(result).toBe(repoPath);
      expect(fs.mkdir).toHaveBeenCalledWith(repoPath, { recursive: true });
    });

    it('should handle directory creation failure', async () => {
      const repoId = 'test-repo';
      const repoPath = path.join(mockBaseDir, repoId);

      (path.join as jest.Mock).mockReturnValue(repoPath);

      const error = new Error('Permission denied');
      (error as any).code = 'EPERM';
      (fs.mkdir as jest.Mock).mockRejectedValue(error);

      await expect(service.ensureRepoDirectory(repoId)).rejects.toThrow(
        'Permission denied',
      );
    });
  });

  describe('writeFile', () => {
    it('should write content to file', async () => {
      const repoId = 'test-repo';
      const filePath = 'test.txt';
      const content = 'test content';
      const fullPath = path.join(mockBaseDir, repoId, filePath);

      (path.join as jest.Mock).mockReturnValue(fullPath);
      (path.dirname as jest.Mock).mockReturnValue(
        path.join(mockBaseDir, repoId),
      );
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      await service.writeFile(repoId, filePath, content);

      expect(fs.writeFile).toHaveBeenCalledWith(fullPath, content, 'utf8');
    });

    it('should handle directory creation failure', async () => {
      const repoId = 'test-repo';
      const filePath = 'test.txt';
      const content = 'test content';
      const fullPath = path.join(mockBaseDir, repoId, filePath);
      const dirPath = path.join(mockBaseDir, repoId);

      (path.join as jest.Mock).mockReturnValue(fullPath);
      (path.dirname as jest.Mock).mockReturnValue(dirPath);

      const error = new Error('Permission denied');
      (error as any).code = 'EPERM';
      (fs.mkdir as jest.Mock).mockRejectedValue(error);

      await expect(
        service.writeFile(repoId, filePath, content),
      ).rejects.toThrow('Failed to write file: Permission denied');
    });

    it('should handle file write failure', async () => {
      const repoId = 'test-repo';
      const filePath = 'test.txt';
      const content = 'test content';
      const fullPath = path.join(mockBaseDir, repoId, filePath);
      const dirPath = path.join(mockBaseDir, repoId);

      (path.join as jest.Mock).mockReturnValue(fullPath);
      (path.dirname as jest.Mock).mockReturnValue(dirPath);
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      const error = new Error('Disk full');
      (fs.writeFile as jest.Mock).mockRejectedValue(error);

      await expect(
        service.writeFile(repoId, filePath, content),
      ).rejects.toThrow('Failed to write file: Disk full');
    });
  });

  describe('readFile', () => {
    it('should read file content', async () => {
      const repoId = 'test-repo';
      const filePath = 'test.txt';
      const content = 'test content';
      const fullPath = path.join(mockBaseDir, repoId, filePath);

      (path.join as jest.Mock).mockReturnValue(fullPath);
      (fs.readFile as jest.Mock).mockResolvedValue(content);

      const result = await service.readFile(repoId, filePath);

      expect(result).toBe(content);
      expect(fs.readFile).toHaveBeenCalledWith(fullPath, 'utf8');
    });

    it('should handle file read failure', async () => {
      const repoId = 'test-repo';
      const filePath = 'test.txt';
      const fullPath = path.join(mockBaseDir, repoId, filePath);

      (path.join as jest.Mock).mockReturnValue(fullPath);

      const error = new Error('File not found');
      (error as any).code = 'ENOENT';
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      await expect(service.readFile(repoId, filePath)).rejects.toThrow(
        'Failed to read file: File not found',
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file', async () => {
      const repoId = 'test-repo';
      const filePath = 'test.txt';
      const fullPath = path.join(mockBaseDir, repoId, filePath);

      (path.join as jest.Mock).mockReturnValue(fullPath);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.deleteFile(repoId, filePath);

      expect(fs.unlink).toHaveBeenCalledWith(fullPath);
    });

    it('should handle file deletion failure', async () => {
      const repoId = 'test-repo';
      const filePath = 'test.txt';
      const fullPath = path.join(mockBaseDir, repoId, filePath);

      (path.join as jest.Mock).mockReturnValue(fullPath);

      const error = new Error('Permission denied');
      (error as any).code = 'EPERM';
      (fs.unlink as jest.Mock).mockRejectedValue(error);

      await expect(service.deleteFile(repoId, filePath)).rejects.toThrow(
        'Failed to delete file: Permission denied',
      );
    });
  });
});
