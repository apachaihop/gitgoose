import { Test, TestingModule } from '@nestjs/testing';
import { BranchesResolver } from './branches.resolver';
import { BranchesService } from './branches.service';
import { CreateBranchInput } from './dto/create-branch.input';
import { UpdateBranchInput } from './dto/update-branch.input';
import { GqlAuthGuard } from '../auth/gql_auth/gql_auth.guard';

describe('BranchesResolver', () => {
  let resolver: BranchesResolver;

  const mockBranchesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByRepository: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    setProtected: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesResolver,
        {
          provide: BranchesService,
          useValue: mockBranchesService,
        },
      ],
    })
      .overrideGuard(GqlAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<BranchesResolver>(BranchesResolver);
  });

  describe('createBranch', () => {
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

      mockBranchesService.create.mockResolvedValue(mockBranch);

      const result = await resolver.createBranch(createBranchInput);
      expect(result).toEqual(mockBranch);
    });
  });

  describe('findAll', () => {
    it('should return an array of branches', async () => {
      const mockBranches = [
        { id: '1', name: 'main' },
        { id: '2', name: 'develop' },
      ];

      mockBranchesService.findAll.mockResolvedValue(mockBranches);

      const result = await resolver.findAll();
      expect(result).toEqual(mockBranches);
    });
  });

  describe('findOne', () => {
    it('should return a single branch', async () => {
      const mockBranch = { id: '1', name: 'main' };
      mockBranchesService.findOne.mockResolvedValue(mockBranch);

      const result = await resolver.findOne('1');
      expect(result).toEqual(mockBranch);
    });
  });

  describe('updateBranch', () => {
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

      mockBranchesService.update.mockResolvedValue(mockBranch);

      const result = await resolver.updateBranch(updateBranchInput);
      expect(result).toEqual(mockBranch);
    });
  });

  describe('setProtected', () => {
    it('should set branch protection status', async () => {
      const mockBranch = {
        id: '1',
        name: 'main',
        isProtected: true,
      };

      mockBranchesService.setProtected.mockResolvedValue(mockBranch);

      const result = await resolver.setProtected('1', true);
      expect(result).toEqual(mockBranch);
    });
  });

  describe('removeBranch', () => {
    it('should remove a branch', async () => {
      const mockBranch = { id: '1', name: 'feature-branch' };
      mockBranchesService.remove.mockResolvedValue(mockBranch);

      const result = await resolver.removeBranch('1');
      expect(result).toEqual(mockBranch);
    });
  });
});
