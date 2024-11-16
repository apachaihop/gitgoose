import { gql } from '@apollo/client';

// Matches GRAPHQL_ROUTES.REPOS.CREATE
export const CREATE_REPOSITORY = gql`
  mutation CreateRepo($input: CreateRepoInput!) {
    createRepo(createRepoInput: $input) {
      id
      name
      description
      isPrivate
      defaultBranch
    }
  }
`;

// Matches GRAPHQL_ROUTES.REPOS.GET_ALL
export const GET_REPOSITORIES = gql`
  query GetRepos {
    repos {
      id
      name
      description
      owner {
        id
        name
      }
    }
  }
`;

// Matches GRAPHQL_ROUTES.REPOS.UPLOAD_FILES
export const UPLOAD_FILES = gql`
  mutation UploadFiles($input: UploadFilesInput!) {
    uploadFiles(input: $input) {
      sha
      message
      authorName
    }
  }
`;