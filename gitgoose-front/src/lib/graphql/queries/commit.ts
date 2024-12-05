import { gql } from '@apollo/client';

export const GET_COMMITS = gql`
  query GetCommits($repositoryId: ID!, $branchName: String!) {
    commitsByBranch(repositoryId: $repositoryId, branchName: $branchName) {
      id
      message
      sha
      author {
        username
        avatarUrl
      }
      createdAt
    }
  }
`;