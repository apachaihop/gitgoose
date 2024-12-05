import { gql } from '@apollo/client';

export const GET_BRANCHES = gql`
  query GetBranches($repositoryId: ID!) {
    branchesByRepository(repositoryId: $repositoryId) {
      id
      name
      isProtected
      lastCommitSha
      lastCommitMessage
      lastCommitAuthor {
        id
        username
        avatarUrl
      }
      protectionRules {
        requirePullRequest
        requiredReviewers
        requireStatusChecks
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_BRANCH = gql`
  query GetBranch($id: ID!) {
    branch(id: $id) {
      id
      name
      isProtected
      lastCommitSha
      lastCommitMessage
      lastCommitAuthor {
        id
        username
      }
      protectionRules {
        requirePullRequest
        requiredReviewers
        requireStatusChecks
      }
    }
  }
`;