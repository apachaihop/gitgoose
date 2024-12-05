import { gql } from '@apollo/client';

export const GET_PULL_REQUEST = gql`
  query GetPullRequest($id: ID!) {
    pullRequest(id: $id) {
      id
      title
      body
      state
      isMerged
      number
      sourceBranch
      targetBranch
      author {
        id
        username
      }
      reviewers {
        id
        username
      }
      comments {
        id
        body
        author {
          username
        }
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_PULL_REQUESTS_BY_REPOSITORY = gql`
  query GetPullRequestsByRepository($repositoryId: ID!) {
    pullRequestsByRepository(repositoryId: $repositoryId) {
      id
      title
      state
      isMerged
      number
      author {
        username
      }
      createdAt
    }
  }
`;