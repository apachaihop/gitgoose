import { Test, TestingModule } from '@nestjs/testing';
import { BranchesService } from './branches.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchInput } from './dto/create-branch.input';
import { UpdateBranchInput } from './dto/update-branch.input';
import { NotFoundException } from '@nestjs/common';
import { GitClientService } from '../git-client/git-client.service';

describe('BranchesService', () => {
  let service: BranchesService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
    })),
  };

  const mockGitClientService = {
    createBranch: jest.fn(),
    deleteBranch: jest.fn(),
    getBranches: jest.fn(),
    handleBranchOperation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        {
          provide: getRepositoryToken(Branch),
          useValue: mockRepository,
        },
        {
          provide: GitClientService,
          useValue: mockGitClientService,
        },
      ],
    }).compile();

    service = module.get<BranchesService>(BranchesService);
  });

  describe('create', () => {
    it('should create a new branch', async () => {
      const createBranchInput: CreateBranchInput = {
        name: 'feature-branch',
        repositoryId: '1',
        lastCommitSha: 'abc123',
        lastCommitMessage: 'Initial commit',
        lastCommitAuthorId: '1',
      };

      const mockBranch = {
        id: '1',
        ...createBranchInput,
        isProtected: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockBranch);
      mockRepository.save.mockResolvedValue(mockBranch);

      const result = await service.create(createBranchInput);
      expect(result).toEqual(mockBranch);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createBranchInput,
        isProtected: false,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of branches', async () => {
      const mockBranches = [
        { id: '1', name: 'main' },
        { id: '2', name: 'develop' },
      ];

      mockRepository.find.mockResolvedValue(mockBranches);

      const result = await service.findAll();
      expect(result).toEqual(mockBranches);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['repository', 'lastCommitAuthor'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single branch', async () => {
      const mockBranch = { id: '1', name: 'main' };
      mockRepository.findOne.mockResolvedValue(mockBranch);

      const result = await service.findOne('1');
      expect(result).toEqual(mockBranch);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['repository', 'lastCommitAuthor'],
      });
    });

    it('should throw NotFoundException when branch not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByRepository', () => {
    it('should return branches for a specific repository', async () => {
      const mockBranches = [
        {
          id: '1',
          name: 'main',
          repositoryId: '1',
          lastCommitSha: 'sha1',
        },
        {
          id: '2',
          name: 'develop',
          repositoryId: '1',
          lastCommitSha: 'sha2',
        },
      ];

      const mockGitBranches = [
        { name: 'main', sha: 'sha1' },
        { name: 'develop', sha: 'sha2' },
      ];

      mockRepository.find.mockResolvedValue(mockBranches);
      mockRepository.findOne.mockImplementation((options) => {
        const branch = mockBranches.find((b) => b.id === options.where.id);
        return Promise.resolve(branch);
      });
      mockGitClientService.getBranches.mockResolvedValue(mockGitBranches);

      const result = await service.findByRepository('1');
      expect(result).toEqual(mockBranches);
    });
  });

  describe('update', () => {
    it('should update a branch', async () => {
      const updateBranchInput: UpdateBranchInput = {
        id: '1',
        lastCommitSha: 'def456',
        lastCommitMessage: 'Update commit',
      };

      const mockBranch = {
        id: '1',
        name: 'feature-branch',
        ...updateBranchInput,
      };

      mockRepository.findOne.mockResolvedValue(mockBranch);
      mockRepository.save.mockResolvedValue(mockBranch);

      const result = await service.update('1', updateBranchInput);
      expect(result).toEqual(mockBranch);
    });

    it('should throw NotFoundException when branch not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('1', { id: '1', name: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a branch', async () => {
      const mockBranch = {
        id: '1',
        name: 'feature-branch',
        isProtected: false,
        repositoryId: '1',
      };

      mockRepository.findOne.mockResolvedValue(mockBranch);
      mockRepository.remove.mockResolvedValue(mockBranch);
      mockGitClientService.handleBranchOperation.mockResolvedValue(undefined);

      const result = await service.remove('1');
      expect(result).toEqual(mockBranch);
      expect(mockGitClientService.handleBranchOperation).toHaveBeenCalledWith({
        repoId: '1',
        operation: 'delete',
        branch: 'feature-branch',
      });
    });

    it('should throw error when trying to remove protected branch', async () => {
      const mockBranch = {
        id: '1',
        name: 'main',
        isProtected: true,
      };
      mockRepository.findOne.mockResolvedValue(mockBranch);

      await expect(service.remove('1')).rejects.toThrow(
        'Cannot delete protected branch',
      );
    });
  });

  describe('setProtected', () => {
    it('should set branch protection status', async () => {
      const mockBranch = {
        id: '1',
        name: 'main',
        isProtected: false,
      };

      const updatedBranch = {
        ...mockBranch,
        isProtected: true,
      };

      mockRepository.findOne.mockResolvedValue(mockBranch);
      mockRepository.save.mockResolvedValue(updatedBranch);

      const result = await service.setProtected('1', true);
      expect(result).toEqual(updatedBranch);
      expect(result.isProtected).toBe(true);
    });

    it('should throw NotFoundException when branch not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.setProtected('1', true)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
