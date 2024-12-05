import type { User } from './index';

export interface BranchProtectionRules {
    requirePullRequest: boolean;
    requiredReviewers: number;
    requireStatusChecks: boolean;
  }
  
  export interface Branch {
    id: string;
    name: string;
    isProtected: boolean;
    lastCommitSha: string;
    lastCommitMessage?: string;
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
  
  export interface CreateBranchInput {
    name: string;
    repositoryId: string;
    sourceBranch: string;
  }
  
  export interface UpdateBranchInput {
    id: string;
    name?: string;
    isProtected?: boolean;
    protectionRules?: {
      requirePullRequest?: boolean;
      requiredReviewers?: number;
      requireStatusChecks?: boolean;
    };
  }
  
  export interface BranchProtectionRulesInput {
    requirePullRequest?: boolean;
    requiredReviewers?: number;
    requireStatusChecks?: boolean;
  }