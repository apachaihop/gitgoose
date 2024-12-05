import { gql } from '@apollo/client';

export const GET_USER_ACTIVITY = gql`
  query GetActivitiesWithFilter($input: GetActivitiesInput!) {
    activities(input: $input) {
      id
      type
      description
      timestamp
      repository {
        id
        name
        path
        owner {
          id
          username
          avatarUrl
        }
      }
    }
  }
`;