import type { 
  Repository, 
  Branch, 
  Issue, 
  PullRequest, 
  Commit, 
} from './index';

// Repository Queries
export interface RepositoriesData {
  repos: Repository[];
}

export interface RepositoryData {
  repo: Repository;
}

export interface RepositoryFilesData {
  getRepositoryFiles: {
    path: string;
    type: 'file' | 'directory';
    content?: string;
    size?: number;
    children?: {
      path: string;
      type: 'file' | 'directory';
      size?: number;
    }[];
  }[];
}

export interface RepositoryDetailsData {
  repository: Repository & {
    branches: Branch[];
    commits: Commit[];
  };
}

// Branch Queries
export interface BranchesData {
  branchesByRepository: Branch[];
}

export interface BranchData {
  branch: Branch;
}

// Issue Queries
export interface IssueData {
  issue: Issue;
}

export interface IssuesByRepositoryData {
  issuesByRepository: Issue[];
}

// Pull Request Queries
export interface PullRequestData {
  pullRequest: PullRequest;
}

export interface PullRequestsByRepositoryData {
  pullRequestsByRepository: PullRequest[];
}

// Commit Queries
export interface CommitsData {
  commitsByRepository: Commit[];
}

// Query Variables
export interface RepositoryVariables {
  id: string;
}

export interface RepositoryFilesVariables {
  repositoryId: string;
  ref?: string;
  path?: string;
}

export interface RepositoryDetailsVariables {
  owner: string;
  name: string;
}

export interface BranchesVariables {
  repositoryId: string;
}

export interface BranchVariables {
  id: string;
}

export interface IssueVariables {
  id: string;
}

export interface IssuesByRepositoryVariables {
  repositoryId: string;
}

export interface PullRequestVariables {
  id: string;
}

export interface PullRequestsByRepositoryVariables {
  repositoryId: string;
}

export interface CommitsVariables {
  repositoryId: string;
}

export interface CheckPermissionVariables {
  repoId: string;
  userId: string;
  permission: string;
}