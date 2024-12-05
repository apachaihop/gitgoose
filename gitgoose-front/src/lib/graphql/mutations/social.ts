import { gql } from "@apollo/client";

export const STAR_REPOSITORY = gql`
  mutation StarRepository($repositoryId: ID!) {
    starRepository(repositoryId: $repositoryId) {
      id
      starsCount
      isStarredByViewer
    }
  }
`;

export const UNSTAR_REPOSITORY = gql`
  mutation UnstarRepository($repositoryId: ID!) {
    unstarRepository(repositoryId: $repositoryId) {
      id
      starsCount
      isStarredByViewer
    }
  }
`;

export const WATCH_REPOSITORY = gql`
  mutation WatchRepository($repositoryId: ID!) {
    watchRepository(repositoryId: $repositoryId) {
      id
      watchersCount
      isWatchedByViewer
    }
  }
`;

export const UNWATCH_REPOSITORY = gql`
  mutation UnwatchRepository($repositoryId: ID!) {
    unwatchRepository(repositoryId: $repositoryId) {
      id
      watchersCount
      isWatchedByViewer
    }
  }
`;

export const FOLLOW_USER = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      id
      isFollowedByViewer
    }
  }
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId) {
      id
      isFollowedByViewer
    }
  }
`;