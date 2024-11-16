import { Test, TestingModule } from '@nestjs/testing';
import { ReposResolver } from './repos.resolver';
import { ReposService } from './repos.service';
import { CreateRepoInput } from './dto/create-repo.input';
import { UpdateRepoInput } from './dto/update-repo.input';

describe('ReposResolver', () => {
  let resolver: ReposResolver;

  const mockReposService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReposResolver,
        {
          provide: ReposService,
          useValue: mockReposService,
        },
      ],
    }).compile();

    resolver = module.get<ReposResolver>(ReposResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRepo', () => {
    it('should create a new repository', async () => {
      const createRepoInput: CreateRepoInput = {
        name: 'test-repo',
        description: 'Test repository',
        isPrivate: false,
        defaultBranch: 'main',
      };

      const expectedRepo = {
        id: '1',
        ...createRepoInput,
        ownerId: 'user-1',
        path: '/test-repo',
        createdAt: new Date(),
        updatedAt: new Date(),
        starsCount: 0,
        forksCount: 0,
        isFork: false,
      };

      mockReposService.create.mockResolvedValue(expectedRepo);

      const result = await resolver.createRepo(createRepoInput);

      expect(result).toEqual(expectedRepo);
      expect(mockReposService.create).toHaveBeenCalledWith(createRepoInput);
    });
  });

  describe('findAll', () => {
    it('should return an array of repositories', async () => {
      const expectedRepos = [
        { id: '1', name: 'repo1' },
        { id: '2', name: 'repo2' },
      ];

      mockReposService.findAll.mockResolvedValue(expectedRepos);

      const result = await resolver.findAll();

      expect(result).toEqual(expectedRepos);
      expect(mockReposService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single repository', async () => {
      const expectedRepo = {
        id: '1',
        name: 'test-repo',
      };

      mockReposService.findOne.mockResolvedValue(expectedRepo);

      const result = await resolver.findOne('1');

      expect(result).toEqual(expectedRepo);
      expect(mockReposService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('updateRepo', () => {
    it('should update a repository', async () => {
      const updateRepoInput: UpdateRepoInput = {
        id: '1',
        name: 'updated-repo',
      };

      const expectedRepo = {
        id: '1',
        name: 'updated-repo',
        description: 'Test repository',
        isPrivate: false,
        defaultBranch: 'main',
      };

      mockReposService.update.mockResolvedValue(expectedRepo);

      const result = await resolver.updateRepo(updateRepoInput);

      expect(result).toEqual(expectedRepo);
      expect(mockReposService.update).toHaveBeenCalledWith(
        updateRepoInput.id,
        updateRepoInput,
      );
    });
  });

  describe('removeRepo', () => {
    it('should remove a repository', async () => {
      const expectedRepo = {
        id: '1',
        name: 'test-repo',
      };

      mockReposService.remove.mockResolvedValue(expectedRepo);

      const result = await resolver.removeRepo('1');

      expect(result).toEqual(expectedRepo);
      expect(mockReposService.remove).toHaveBeenCalledWith('1');
    });
  });
});
