import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Issue } from '../src/issues/entities/issue.entity';
import { PullRequest } from '../src/pull_requests/entities/pull_request.entity';
import { Repo } from '../src/repos/entities/repo.entity';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { testConfig } from './test-config';
import { GoogleStrategy } from '../src/auth/google/google-oauth.strategy';

describe('GitGoose API (e2e)', () => {
  let app: INestApplication;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockGoogleStrategy = {
    validate: jest.fn().mockResolvedValue({
      id: 'test-user',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
          ignoreEnvFile: false,
        }),
        TypeOrmModule.forRoot(testConfig),
        AppModule,
      ],
    })
      .overrideProvider(getRepositoryToken(Issue))
      .useValue(mockRepository)
      .overrideProvider(getRepositoryToken(PullRequest))
      .useValue(mockRepository)
      .overrideProvider(getRepositoryToken(Repo))
      .useValue(mockRepository)
      .overrideProvider(GoogleStrategy)
      .useValue(mockGoogleStrategy)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Repository Operations', () => {
    it('should create and manage a repository', async () => {
      // Create repository
      const createRepoResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateRepo($input: CreateRepoInput!) {
              createRepo(createRepoInput: $input) {
                id
                name
                description
                defaultBranch
                isPrivate
              }
            }
          `,
          variables: {
            input: {
              name: 'test-repo',
              description: 'Test repository',
              defaultBranch: 'main',
              isPrivate: false,
            },
          },
        });

      expect(createRepoResponse.status).toBe(200);
      expect(createRepoResponse.body.data.createRepo).toBeDefined();
      const repoId = createRepoResponse.body.data.createRepo.id;

      // Get repository details
      const getRepoResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetRepo($id: ID!) {
              repo(id: $id) {
                id
                name
                description
                defaultBranch
              }
            }
          `,
          variables: {
            id: repoId,
          },
        });

      expect(getRepoResponse.status).toBe(200);
      expect(getRepoResponse.body.data.repo.name).toBe('test-repo');
    });
  });

  describe('Branch Operations', () => {
    it('should create and manage branches', async () => {
      // First create a repository
      const createRepoResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateRepo($input: CreateRepoInput!) {
              createRepo(createRepoInput: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: 'branch-test-repo',
              description: 'Test repository for branches',
              defaultBranch: 'main',
              isPrivate: false,
            },
          },
        });

      const repoId = createRepoResponse.body.data.createRepo.id;

      // Create a new branch
      const createBranchResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateBranch($input: CreateBranchInput!) {
              createBranch(createBranchInput: $input) {
                id
                name
                isProtected
              }
            }
          `,
          variables: {
            input: {
              name: 'feature-branch',
              repositoryId: repoId,
              lastCommitSha: 'initial-commit-sha',
              lastCommitMessage: 'Initial commit',
              lastCommitAuthorId: 'test-user',
            },
          },
        });

      expect(createBranchResponse.status).toBe(200);
      expect(createBranchResponse.body.data.createBranch.name).toBe(
        'feature-branch',
      );

      // List branches
      const listBranchesResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetRepoBranches($repoId: ID!) {
              branchesByRepository(repositoryId: $repoId) {
                id
                name
                isProtected
              }
            }
          `,
          variables: {
            repoId: repoId,
          },
        });

      expect(listBranchesResponse.status).toBe(200);
      expect(
        listBranchesResponse.body.data.branchesByRepository.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('Pull Request Operations', () => {
    it('should create and manage pull requests', async () => {
      // Create repository first
      const repoResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateRepo($input: CreateRepoInput!) {
              createRepo(createRepoInput: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: 'pr-test-repo',
              description: 'Test repository for PRs',
              defaultBranch: 'main',
              isPrivate: false,
            },
          },
        });

      const repoId = repoResponse.body.data.createRepo.id;

      // Create pull request
      const createPRResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreatePR($input: CreatePullRequestInput!) {
              createPullRequest(createPullRequestInput: $input) {
                id
                title
                state
                isMerged
              }
            }
          `,
          variables: {
            input: {
              title: 'Test PR',
              body: 'Test description',
              repositoryId: repoId,
              sourceBranch: 'feature',
              targetBranch: 'main',
              authorId: 'test-user',
            },
          },
        });

      expect(createPRResponse.status).toBe(200);
      const prId = createPRResponse.body.data.createPullRequest.id;

      // Get PR details
      const getPRResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetPR($id: ID!) {
              pullRequest(id: $id) {
                id
                title
                state
                isMerged
              }
            }
          `,
          variables: {
            id: prId,
          },
        });

      expect(getPRResponse.status).toBe(200);
      expect(getPRResponse.body.data.pullRequest.state).toBe('open');

      // Merge PR
      const mergePRResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation MergePR($id: ID!) {
              mergePullRequest(id: $id) {
                id
                state
                isMerged
              }
            }
          `,
          variables: {
            id: prId,
          },
        });

      expect(mergePRResponse.status).toBe(200);
      expect(mergePRResponse.body.data.mergePullRequest.isMerged).toBe(true);
      expect(mergePRResponse.body.data.mergePullRequest.state).toBe('closed');
    });
  });
});
