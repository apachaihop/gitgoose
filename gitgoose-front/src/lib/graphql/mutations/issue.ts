import { gql } from '@apollo/client';

export const CREATE_ISSUE = gql`
  mutation CreateIssue($input: CreateIssueInput!) {
    createIssue(createIssueInput: $input) {
      id
      title
      state
    }
  }
`;

export const UPDATE_ISSUE = gql`
  mutation UpdateIssue($input: UpdateIssueInput!) {
    updateIssue(updateIssueInput: $input) {
      id
      title
      body
    }
  }
`;

export const ASSIGN_ISSUE = gql`
  mutation AssignIssue($issueId: ID!, $assigneeId: ID!) {
    assignIssue(issueId: $issueId, assigneeId: $assigneeId) {
      id
      assignees {
        id
        username
      }
    }
  }
`;

export const ADD_LABEL = gql`
  mutation AddLabel($id: ID!, $label: String!) {
    addLabel(id: $id, label: $label) {
      id
      labels
    }
  }
`;

export const CHANGE_ISSUE_STATE = gql`
  mutation ChangeIssueState($issueId: ID!, $state: String!) {
    changeIssueState(issueId: $issueId, state: $state) {
      id
      state
    }
  }
`;

export const REMOVE_LABEL = gql`
  mutation RemoveLabel($id: ID!, $label: String!) {
    removeLabel(id: $id, label: $label) {
      id
      labels
    }
  }
`;

export const UNASSIGN_ISSUE = gql`
  mutation UnassignIssue($issueId: ID!, $assigneeId: ID!) {
    unassignIssue(issueId: $issueId, assigneeId: $assigneeId) {
      id
      assignees {
        id
        username
      }
    }
  }
`;