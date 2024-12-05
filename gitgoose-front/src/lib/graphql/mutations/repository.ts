import { gql } from '@apollo/client';

export const CREATE_REPO = gql`
  mutation CreateRepo($input: CreateRepoInput!) {
    createRepo(createRepoInput: $input) {
      id
      name
      description
      defaultBranch
      isPrivate
    }
  }
`;

export const UPDATE_REPO = gql`
  mutation UpdateRepo($input: UpdateRepoInput!) {
    updateRepo(updateRepoInput: $input) {
      id
      name
      description
    }
  }
`;

export const SET_REPO_VISIBILITY = gql`
  mutation SetRepoVisibility($id: ID!, $isPrivate: Boolean!) {
    setVisibility(id: $id, isPrivate: $isPrivate) {
      id
      isPrivate
    }
  }
`;