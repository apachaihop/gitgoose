import { Test, TestingModule } from '@nestjs/testing';
import { IssuesService } from './issues.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Issue } from './entities/issue.entity';
import { CreateIssueInput } from './dto/create-issue.input';
import { UpdateIssueInput } from './dto/update-issue.input';

describe('IssuesService', () => {
  let service: IssuesService;

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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssuesService,
        {
          provide: getRepositoryToken(Issue),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<IssuesService>(IssuesService);
  });

  describe('create', () => {
    it('should create a new issue', async () => {
      const createIssueInput: CreateIssueInput = {
        title: 'Test Issue',
        body: 'Test description',
        repositoryId: '1',
        authorId: '1',
      };

      const mockIssue = {
        id: '1',
        number: 1,
        ...createIssueInput,
        state: 'open',
        labels: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockIssue);
      mockRepository.save.mockResolvedValue(mockIssue);

      const result = await service.create(createIssueInput);
      expect(result).toEqual(mockIssue);
    });
  });

  describe('findAll', () => {
    it('should return an array of issues', async () => {
      const mockIssues = [
        { id: '1', title: 'Issue 1' },
        { id: '2', title: 'Issue 2' },
      ];

      mockRepository.find.mockResolvedValue(mockIssues);

      const result = await service.findAll();
      expect(result).toEqual(mockIssues);
    });
  });

  describe('findByRepository', () => {
    it('should return issues for a specific repository', async () => {
      const mockIssues = [
        { id: '1', title: 'Issue 1', repositoryId: '1' },
        { id: '2', title: 'Issue 2', repositoryId: '1' },
      ];

      mockRepository.find.mockResolvedValue(mockIssues);

      const result = await service.findByRepository('1');
      expect(result).toEqual(mockIssues);
    });
  });

  describe('update', () => {
    it('should update an issue', async () => {
      const updateIssueInput: UpdateIssueInput = {
        id: '1',
        title: 'Updated Issue',
      };

      const mockIssue = {
        id: '1',
        title: 'Updated Issue',
        state: 'open',
      };

      mockRepository.findOne.mockResolvedValue(mockIssue);
      mockRepository.save.mockResolvedValue(mockIssue);

      const result = await service.update('1', updateIssueInput);
      expect(result).toEqual(mockIssue);
    });
  });
});
