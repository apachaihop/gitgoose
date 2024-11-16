import { Test, TestingModule } from '@nestjs/testing';
import { PullRequestsResolver } from './pull_requests.resolver';
import { PullRequestsService } from './pull_requests.service';
import { CreatePullRequestInput } from './dto/create-pull_request.input';
import { UpdatePullRequestInput } from './dto/update-pull_request.input';
import { GqlAuthGuard } from '../auth/gql_auth/gql_auth.guard';

describe('PullRequestsResolver', () => {
  let resolver: PullRequestsResolver;

  const mockPullRequestsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByRepository: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PullRequestsResolver,
        {
          provide: PullRequestsService,
          useValue: mockPullRequestsService,
        },
      ],
    })
      .overrideGuard(GqlAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<PullRequestsResolver>(PullRequestsResolver);
  });

  describe('createPullRequest', () => {
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

      mockPullRequestsService.create.mockResolvedValue(mockPR);

      const result = await resolver.createPullRequest(createPullRequestInput);
      expect(result).toEqual(mockPR);
      expect(mockPullRequestsService.create).toHaveBeenCalledWith(
        createPullRequestInput,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of pull requests', async () => {
      const mockPRs = [
        { id: '1', title: 'PR 1' },
        { id: '2', title: 'PR 2' },
      ];

      mockPullRequestsService.findAll.mockResolvedValue(mockPRs);

      const result = await resolver.findAll();
      expect(result).toEqual(mockPRs);
    });
  });

  describe('findOne', () => {
    it('should return a single pull request', async () => {
      const mockPR = { id: '1', title: 'PR 1' };
      mockPullRequestsService.findOne.mockResolvedValue(mockPR);

      const result = await resolver.findOne('1');
      expect(result).toEqual(mockPR);
    });
  });

  describe('findByRepository', () => {
    it('should return pull requests for a repository', async () => {
      const mockPRs = [
        { id: '1', title: 'PR 1', repositoryId: '1' },
        { id: '2', title: 'PR 2', repositoryId: '1' },
      ];

      mockPullRequestsService.findByRepository.mockResolvedValue(mockPRs);

      const result = await resolver.findByRepository('1');
      expect(result).toEqual(mockPRs);
    });
  });

  describe('updatePullRequest', () => {
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

      mockPullRequestsService.update.mockResolvedValue(mockPR);

      const result = await resolver.updatePullRequest(updatePullRequestInput);
      expect(result).toEqual(mockPR);
    });
  });

  describe('mergePullRequest', () => {
    it('should merge a pull request', async () => {
      const mockContext = {
        req: {
          user: {
            id: 'user-1',
          },
        },
      };

      const mockPR = {
        id: '1',
        title: 'Test PR',
        isMerged: true,
        mergedAt: new Date(),
        mergedById: 'user-1',
        state: 'closed',
      };

      mockPullRequestsService.merge.mockResolvedValue(mockPR);

      const result = await resolver.mergePullRequest('1', mockContext);

      expect(result).toEqual(mockPR);
      expect(mockPullRequestsService.merge).toHaveBeenCalledWith('1', 'user-1');
    });
  });

  describe('removePullRequest', () => {
    it('should remove a pull request', async () => {
      const mockPR = { id: '1', title: 'PR 1' };
      mockPullRequestsService.remove.mockResolvedValue(mockPR);

      const result = await resolver.removePullRequest('1');
      expect(result).toEqual(mockPR);
    });
  });
});
