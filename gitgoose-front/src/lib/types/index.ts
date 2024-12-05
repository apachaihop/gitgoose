// User types
export interface User {
    id: string;
    email: string;
    username: string;
    name?: string;
    bio?: string;
    location?: string;
    website?: string;
    avatarUrl?: string;
    isAdmin: boolean;
    isActive: boolean;
    roles: string[];
    createdAt: string;
    updatedAt: string;
    emailNotificationsEnabled: boolean;
    preferences?: any;
    publicReposCount: number;
    privateReposCount: number;
    followersCount: number;
    followingCount: number;
}
  
  // Repository types
  export interface Repository {
    id: string;
    name: string;
    description?: string;
    isPrivate: boolean;
    defaultBranch: string;
    path: string;
    starsCount: number;
    watchersCount: number;
    forksCount: number;
    updatedAt: string;
    languageStatsEntities?: Array<{
      language: string;
      percentage: number;
      bytes: number;
    }>;
    owner: {
      id: string;
      username: string;
      avatarUrl?: string;
    };
  }
  
  export interface CreateRepoInput {
    name: string;
    description?: string;
    isPrivate?: boolean;
    defaultBranch?: string;
  }
  
  export interface UpdateRepoInput {
    id: string;
    name?: string;
    description?: string;
  }
  
  // Branch types
  export interface Branch {
    id: string;
    name: string;
    isProtected: boolean;
    lastCommitSha: string;
    lastCommitMessage?: string;
    lastCommitAuthor?: User;
    protectionRules?: BranchProtectionRules;
    repository?: {
      id: string;
      name: string;
      owner: {
        username: string;
      };
    };
    createdAt: string;
    updatedAt: string;
  }
  
  export interface BranchProtectionRules {
    requirePullRequest: boolean;
    requiredReviewers: number;
    requireStatusChecks: boolean;
  }
  
  export interface CreateBranchInput {
    name: string;
    repositoryId: string;
    sourceBranch: string;
  }
  
  export interface UpdateBranchInput {
    id: string;
    name?: string;
    isProtected?: boolean;
    protectionRules?: BranchProtectionRulesInput;
  }
  
  export interface BranchProtectionRulesInput {
    requirePullRequest?: boolean;
    requiredReviewers?: number;
    requireStatusChecks?: boolean;
  }
  
  // Issue types
  export interface Issue {
    id: string;
    title: string;
    body: string;
    state: string;
    labels: string[];
    author: User;
    assignees: User[];
    repository: Repository;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CreateIssueInput {
    title: string;
    body: string;
    repositoryId: string;
  }
  
  export interface UpdateIssueInput {
    id: string;
    title?: string;
    body?: string;
  }
  
  // Pull Request types
  export interface PullRequest {
    id: string;
    title: string;
    body: string;
    state: string;
    isMerged: boolean;
    number: number;
    sourceBranch: string;
    targetBranch: string;
    author: User;
    reviewers: User[];
    repository: Repository;
    comments: Comment[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Comment {
    id: string;
    body: string;
    author: User;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CreatePullRequestInput {
    title: string;
    body: string;
    repositoryId: string;
    sourceBranch: string;
    targetBranch: string;
    isDraft?: boolean;
  }
  
  export interface UpdatePullRequestInput {
    id: string;
    title?: string;
    body?: string;
  }
  
  // Commit types
  export interface Commit {
    id: string;
    sha: string;
    message: string;
    authorName: string;
    authorEmail?: string;
    author?: User;
    createdAt: string;
  }
  
  export interface FileOperation {
    path: string;
    content: string;
    operation: 'add' | 'update' | 'delete';
  }
  
  export interface CreateCommitInput {
    repositoryId: string;
    message: string;
    branch: string;
    authorId: string;
    authorName: string;
    authorEmail: string;
    files: FileOperation[];
  }