import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Pull Request Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and merge a pull request', async () => {
    // Create repository
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
            name: 'test-repo',
            description: 'Test repository',
            ownerId: 'test-user',
          },
        },
      });

    const repoId = repoResponse.body.data.createRepo.id;

    // Create pull request
    const prResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation CreatePR($input: CreatePullRequestInput!) {
            createPullRequest(createPullRequestInput: $input) {
              id
              number
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

    const prId = prResponse.body.data.createPullRequest.id;

    // Merge pull request
    const mergeResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation MergePR($id: ID!) {
            mergePullRequest(id: $id) {
              id
              isMerged
              state
            }
          }
        `,
        variables: {
          id: prId,
        },
      });

    expect(mergeResponse.body.data.mergePullRequest.isMerged).toBe(true);
    expect(mergeResponse.body.data.mergePullRequest.state).toBe('closed');
  });
});
