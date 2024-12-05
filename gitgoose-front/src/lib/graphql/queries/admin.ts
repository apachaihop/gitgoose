import { gql } from '@apollo/client';

export const GET_USER_STATS = gql`
  query GetUserStats {
    userStats {
      totalUsers
      activeUsers
      adminUsers
      inactiveUsers
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      username
      isAdmin
      isActive
      roles
      createdAt
    }
  }
`;

export const PROMOTE_TO_ADMIN = gql`
  mutation PromoteToAdmin($userId: ID!, $roles: [String!]!) {
    promoteToAdmin(userId: $userId, roles: $roles) {
      id
      isAdmin
      roles
    }
  }
`;

export const SUSPEND_USER = gql`
  mutation SuspendUser($userId: ID!) {
    suspendUser(userId: $userId) {
      id
      isActive
    }
  }
`;