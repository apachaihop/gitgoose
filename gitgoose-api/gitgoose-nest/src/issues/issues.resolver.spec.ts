import { Test, TestingModule } from '@nestjs/testing';
import { IssuesResolver } from './issues.resolver';
import { IssuesService } from './issues.service';
import { CreateIssueInput } from './dto/create-issue.input';
import { UpdateIssueInput } from './dto/update-issue.input';
import { GqlAuthGuard } from '../auth/gql_auth/gql_auth.guard';

describe('IssuesResolver', () => {
  let resolver: IssuesResolver;

  const mockIssuesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByRepository: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addLabel: jest.fn(),
    removeLabel: jest.fn(),
    addAssignee: jest.fn(),
    removeAssignee: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssuesResolver,
        {
          provide: IssuesService,
          useValue: mockIssuesService,
        },
      ],
    })
      .overrideGuard(GqlAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<IssuesResolver>(IssuesResolver);
  });

  describe('createIssue', () => {
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

      mockIssuesService.create.mockResolvedValue(mockIssue);

      const result = await resolver.createIssue(createIssueInput);
      expect(result).toEqual(mockIssue);
    });
  });

  describe('findAll', () => {
    it('should return an array of issues', async () => {
      const mockIssues = [
        { id: '1', title: 'Issue 1' },
        { id: '2', title: 'Issue 2' },
      ];

      mockIssuesService.findAll.mockResolvedValue(mockIssues);

      const result = await resolver.findAll();
      expect(result).toEqual(mockIssues);
    });
  });

  describe('findOne', () => {
    it('should return a single issue', async () => {
      const mockIssue = { id: '1', title: 'Issue 1' };
      mockIssuesService.findOne.mockResolvedValue(mockIssue);

      const result = await resolver.findOne('1');
      expect(result).toEqual(mockIssue);
    });
  });

  describe('updateIssue', () => {
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

      mockIssuesService.update.mockResolvedValue(mockIssue);

      const result = await resolver.updateIssue(updateIssueInput);
      expect(result).toEqual(mockIssue);
    });
  });

  describe('addLabel', () => {
    it('should add a label to an issue', async () => {
      const mockIssue = {
        id: '1',
        labels: ['bug', 'feature'],
      };

      mockIssuesService.addLabel.mockResolvedValue(mockIssue);

      const result = await resolver.addLabel('1', 'feature');
      expect(result).toEqual(mockIssue);
    });
  });

  describe('removeLabel', () => {
    it('should remove a label from an issue', async () => {
      const mockIssue = {
        id: '1',
        labels: ['bug'],
      };

      mockIssuesService.removeLabel.mockResolvedValue(mockIssue);

      const result = await resolver.removeLabel('1', 'feature');
      expect(result).toEqual(mockIssue);
    });
  });
});
