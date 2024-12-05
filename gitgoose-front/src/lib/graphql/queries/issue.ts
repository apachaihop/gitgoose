import { gql } from '@apollo/client';

export const GET_ISSUE = gql`
  query GetIssue($id: ID!) {
    issue(id: $id) {
      id
      title
      body
      state
      labels
      author {
        id
        username
      }
      assignees {
        id
        username
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_ISSUES_BY_REPOSITORY = gql`
  query GetIssuesByRepository($repositoryId: ID!) {
    issuesByRepository(repositoryId: $repositoryId) {
      id
      title
      body
      state
      labels
      author {
        id
        username
        avatarUrl
      }
      assignees {
        id
        username
        avatarUrl
      }
      createdAt
      updatedAt
    }
  }
`;