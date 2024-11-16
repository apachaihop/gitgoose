import { gql } from '@apollo/client';

// Matches GRAPHQL_ROUTES.FILES.GET_TREE
export const GET_FILE_TREE = gql`
  query GetFileTree($input: FileTreeRequestDto!) {
    getRepositoryFiles(
      repositoryId: $input.repoId,
      ref: $input.ref,
      path: $input.path
    ) {
      path
      type
      content
      size
    }
  }
`;

// Matches GRAPHQL_ROUTES.FILES.GET_CONTENT
export const GET_FILE_CONTENT = gql`
  query GetFileContent(
    $repositoryId: String!,
    $path: String!,
    $ref: String
  ) {
    getFileContent(
      repositoryId: $repositoryId,
      path: $path,
      ref: $ref
    )
  }
`;