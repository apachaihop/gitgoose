import { Test, TestingModule } from '@nestjs/testing';
import { PullRequestsService } from './pull_requests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PullRequest } from './entities/pull_request.entity';
import { CreatePullRequestInput } from './dto/create-pull_request.input';
import { UpdatePullRequestInput } from './dto/update-pull_request.input';
import { NotFoundException } from '@nestjs/common';
import { GitClientService } from '../git-client/git-client.service';

describe('PullRequestsService', () => {
  let service: PullRequestsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
    })),
    remove: jest.fn(),
  };

  const mockGitClientService = {
    pull: jest.fn(),
    handleBranchOperation: jest.fn(),
    createCommit: jest.fn(),
    push: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PullRequestsService,
        {
          provide: getRepositoryToken(PullRequest),
          useValue: mockRepository,
        },
        {
          provide: GitClientService,
          useValue: mockGitClientService,
        },
      ],
    }).compile();

    service = module.get<PullRequestsService>(PullRequestsService);
  });

  describe('create', () => {
    it('should create a new pull request', async () => {
      const createPullRequestInput: CreatePullRequestInput = {
        title: 'Test PR',
        body: 'Test description',
        repositoryId: '1',
        sourceBranch: 'feature',
        targetBranch: 'main',
        authorId: '1',
      };

      const mockPR = {
        id: '1',
        number: 1,
        ...createPullRequestInput,
        state: 'open',
        isDraft: false,
        isMerged: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockPR);
      mockRepository.save.mockResolvedValue(mockPR);

      const result = await service.create(createPullRequestInput);
      expect(result).toEqual(mockPR);
    });
  });

  describe('findAll', () => {
    it('should return an array of pull requests', async () => {
      const mockPRs = [
        { id: '1', title: 'PR 1' },
        { id: '2', title: 'PR 2' },
      ];

      mockRepository.find.mockResolvedValue(mockPRs);

      const result = await service.findAll();
      expect(result).toEqual(mockPRs);
    });
  });

  describe('findOne', () => {
    it('should return a single pull request', async () => {
      const mockPR = { id: '1', title: 'PR 1' };
      mockRepository.findOne.mockResolvedValue(mockPR);

      const result = await service.findOne('1');
      expect(result).toEqual(mockPR);
    });

    it('should throw NotFoundException when PR not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a pull request', async () => {
      const updatePullRequestInput: UpdatePullRequestInput = {
        id: '1',
        title: 'Updated PR',
      };

      const mockPR = {
        id: '1',
        title: 'Updated PR',
        state: 'open',
      };

      mockRepository.findOne.mockResolvedValue(mockPR);
      mockRepository.save.mockResolvedValue(mockPR);

      const result = await service.update('1', updatePullRequestInput);
      expect(result).toEqual(mockPR);
    });
  });

  describe('remove', () => {
    it('should remove a pull request', async () => {
      const mockPR = { id: '1', title: 'PR 1' };
      mockRepository.findOne.mockResolvedValue(mockPR);
      mockRepository.remove.mockResolvedValue(mockPR);

      const result = await service.remove('1');
      expect(result).toEqual(mockPR);
    });
  });

  describe('merge', () => {
    it('should merge a pull request', async () => {
      const mockPR = {
        id: '1',
        state: 'open',
        isMerged: false,
      };

      const mergedPR = {
        ...mockPR,
        isMerged: true,
        mergedAt: expect.any(Date),
        mergedById: 'user-1',
        state: 'closed',
      };

      mockRepository.findOne.mockResolvedValue(mockPR);
      mockRepository.save.mockResolvedValue(mergedPR);

      const result = await service.merge('1', 'user-1');
      expect(result).toEqual(mergedPR);
    });

    it('should throw error when PR is already merged', async () => {
      const mockPR = {
        id: '1',
        isMerged: true,
      };

      mockRepository.findOne.mockResolvedValue(mockPR);

      await expect(service.merge('1', 'user-1')).rejects.toThrow(
        'Pull request is already merged',
      );
    });

    it('should throw error when PR is not open', async () => {
      const mockPR = {
        id: '1',
        state: 'closed',
        isMerged: false,
      };

      mockRepository.findOne.mockResolvedValue(mockPR);

      await expect(service.merge('1', 'user-1')).rejects.toThrow(
        'Can only merge open pull requests',
      );
    });
  });
});
