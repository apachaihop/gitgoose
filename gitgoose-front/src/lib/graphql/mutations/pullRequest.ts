import { gql } from '@apollo/client';

export const CREATE_PULL_REQUEST = gql`
  mutation CreatePullRequest($input: CreatePullRequestInput!) {
    createPullRequest(createPullRequestInput: $input) {
      id
      title
      state
      isMerged
      number
      sourceBranch
      targetBranch
    }
  }
`;

export const UPDATE_PULL_REQUEST = gql`
  mutation UpdatePullRequest($input: UpdatePullRequestInput!) {
    updatePullRequest(updatePullRequestInput: $input) {
      id
      title
      body
      state
    }
  }
`;

export const MERGE_PULL_REQUEST = gql`
  mutation MergePullRequest($id: ID!) {
    mergePullRequest(id: $id) {
      id
      state
      isMerged
    }
  }
`;