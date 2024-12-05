import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      username
      name
      avatarUrl
      bio
      location
      website
      isAdmin
      isActive
      roles
      createdAt
    }
  }
`;

export const CHECK_PERMISSION = gql`
  query CheckPermission($repoId: ID!, $userId: ID!, $permission: String!) {
    checkPermission(repoId: $repoId, userId: $userId, permission: $permission)
  }
`;