import { gql } from '@apollo/client';

export const GET_REPOSITORIES = gql`
  query GetRepositories {
    repos {
      id
      name
      description
      isPrivate
      defaultBranch
      path
      starsCount
      watchersCount
      forksCount
      languageStatsEntities {
      language
      percentage
      bytes
    }
      updatedAt
      owner {
        id
        username
        avatarUrl
      }
    }
  }
`;

export const GET_REPOSITORY_DETAILS = gql`
  query GetRepositoryByPath($owner: ID!, $name: String!) {
    repoByPath(owner: $owner, name: $name) {
      id
      name
      description
      isPrivate
      defaultBranch
      path
      starsCount
      watchersCount
      forksCount
      updatedAt
      languageStatsEntities {
        language
        percentage
        bytes
      }
      owner {
        id
        username
        avatarUrl
      }
      branches {
        id
        name
        isProtected
        lastCommitSha
      }
      commits {
        id
        sha
        message
        authorName
        createdAt
      }
      issues {
        id
        closedAt
      }
      pullRequests {
        id
        closedAt
      }
    }
  }
`;

export const GET_REPOSITORY = gql`
  query GetRepository($id: ID!) {
    repo(id: $id) {
      id
      name
      description
      isPrivate
      defaultBranch
      path
      starsCount
      watchersCount
      forksCount
      languageStatsEntities {
      language
      percentage
      bytes
    }
      updatedAt
      owner {
        id
        username
        avatarUrl
      }
    }
  }
`;

export const GET_REPOSITORY_FILES = gql`
  query GetRepositoryFiles($repositoryId: String!, $ref: String, $path: String) {
    getRepositoryFiles(repositoryId: $repositoryId, ref: $ref, path: $path) {
      path
      type
      content
      size
      children {
        path
        type
        size
      }
    }
  }
`;

export const GET_REPOSITORY_BY_PATH = gql`
  query GetRepositoryByPath($owner: String!, $name: String!) {
    repoByPath(owner: $owner, name: $name) {
      id
      name
      description
      isPrivate
      defaultBranch
      path
      cloneUrl
      languageStatsEntities {
        language
        percentage
        bytes
      }
      owner {
        id
        username
        avatarUrl
      }
      branches {
        id
        name
        isProtected
        lastCommitSha
      }
      commits {
        id
        sha
        message
        authorName
        createdAt
      }
      issues {
        id
        closedAt
      }
      pullRequests {
        id
        closedAt
      }
    }
  }
`;

export const GET_FILE_DETAILS = gql`
  query GetFileDetails($repositoryId: String!, $path: String!, $ref: String) {
    getFileDetails(repositoryId: $repositoryId, path: $path, ref: $ref) {
      path
      type
      content
      size
    }
  }
`;

export const GET_CLONE_URL = gql`
  query GetCloneUrl($id: ID!) {
    getCloneUrl(id: $id)
  }
`;

export const GET_REPOSITORY_COLLABORATORS = gql`
  query GetRepositoryCollaborators($repositoryId: ID!) {
    repositoryCollaborators(repositoryId: $repositoryId) {
      id
      username
      avatarUrl
    }
  }
`;

export const GET_USER_REPOSITORIES = gql`
  query GetUserRepositories($username: String!) {
    userRepositories(username: $username) {
      id
      name
      description
      isPrivate
      starsCount
      watchersCount
      forksCount
      primaryLanguage
      updatedAt
      languageStatsEntities {
        language
        percentage
        bytes
      }
      owner {
        id
        username
        avatarUrl
      }
    }
  }
`;

export const GET_TRENDING_REPOS = gql`
  query GetTrendingRepos {
    trendingRepos {
      id
      name
      description
      isPrivate
      starsCount
      watchersCount
      forksCount
      updatedAt
      languageStatsEntities {
        language
        percentage
        bytes
      }
      owner {
        id
        username
        avatarUrl
      }
    }
  }
`;

