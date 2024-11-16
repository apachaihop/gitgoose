import { gql } from '@apollo/client';

// Matches GRAPHQL_ROUTES.PULL_REQUESTS.CREATE
export const CREATE_PULL_REQUEST = gql`
  mutation CreatePR($input: CreatePullRequestInput!) {
    createPullRequest(createPullRequestInput: $input) {
      id
      title
      sourceBranch
      targetBranch
    }
  }
`;

// Matches GRAPHQL_ROUTES.PULL_REQUESTS.MERGE
export const MERGE_PULL_REQUEST = gql`
  mutation MergePR($id: ID!) {
    mergePullRequest(id: $id) {
      id
      state
      mergedAt
    }
  }
`;