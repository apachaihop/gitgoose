import { gql } from "@apollo/client";

export const GET_USER_BY_USERNAME = gql`
  query GetUserByUsername($username: String!) {
    userByUsername(username: $username) {
      id
      email
      username
      name
      bio
      location
      website
      avatarUrl
      followersCount
      followingCount
      isFollowedByViewer
      repositories {
        id
        name
        description
        isPrivate
        defaultBranch
        starsCount
        watchersCount
        forksCount
        primaryLanguage
        path
        owner {
          username
          avatarUrl
        }
      }
      starredRepositories {
        id
        name
        description
        isPrivate
        starsCount
        watchersCount
        forksCount
        primaryLanguage
        path
        owner {
          username
          avatarUrl
        }
      }
    }
  }
`;

export const GET_USER_PROFILE = gql`
  query GetUserProfile($username: String!) {
    user(username: $username) {
      id
      username
      name
      bio
      location
      website
      avatarUrl
      email
    }
  }
`;