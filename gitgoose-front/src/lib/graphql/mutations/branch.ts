import { gql } from '@apollo/client';

export const CREATE_BRANCH = gql`
  mutation CreateBranch($input: CreateBranchInput!) {
    createBranch(createBranchInput: $input) {
      id
      name
      lastCommitSha
      lastCommitMessage
    }
  }
`;

export const UPDATE_BRANCH = gql`
  mutation UpdateBranch($input: UpdateBranchInput!) {
    updateBranch(updateBranchInput: $input) {
      id
      name
      isProtected
      protectionRules {
        requirePullRequest
        requiredReviewers
        requireStatusChecks
      }
    }
  }
`;

export const SET_BRANCH_PROTECTION = gql`
  mutation SetBranchProtection($id: ID!, $isProtected: Boolean!, $rules: BranchProtectionRulesInput) {
    setProtected(id: $id, isProtected: $isProtected, rules: $rules) {
      id
      isProtected
      protectionRules {
        requirePullRequest
        requiredReviewers
        requireStatusChecks
      }
    }
  }
`;