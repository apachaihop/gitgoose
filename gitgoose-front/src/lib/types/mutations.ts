import type { 
  Repository, 
  Branch, 
  Issue, 
  PullRequest,
  CreateRepoInput,
  UpdateRepoInput,
  CreateBranchInput,
  UpdateBranchInput,
  CreateIssueInput,
  UpdateIssueInput,
  CreatePullRequestInput,
  UpdatePullRequestInput,
  BranchProtectionRulesInput,
  User
} from './index';

// Repository Mutations
export interface CreateRepoData {
  createRepo: Repository;
}

export interface UpdateRepoData {
  updateRepo: Repository;
}

export interface SetVisibilityData {
  setVisibility: {
    id: string;
    isPrivate: boolean;
  };
}

// Branch Mutations
export interface CreateBranchData {
  createBranch: Branch;
}

export interface UpdateBranchData {
  updateBranch: Branch;
}

export interface SetBranchProtectionData {
  setProtected: Branch;
}

// Issue Mutations
export interface CreateIssueData {
  createIssue: Issue;
}

export interface UpdateIssueData {
  updateIssue: Issue;
}

export interface AssignIssueData {
  assignIssue: Issue;
}

export interface UnassignIssueData {
  unassignIssue: Issue;
}

export interface AddLabelData {
  addLabel: {
    id: string;
    labels: string[];
  };
}

export interface RemoveLabelData {
  removeLabel: {
    id: string;
    labels: string[];
  };
}

export interface ChangeIssueStateData {
  changeIssueState: {
    id: string;
    state: string;
  };
}

// Pull Request Mutations
export interface CreatePullRequestData {
  createPullRequest: PullRequest;
}

export interface UpdatePullRequestData {
  updatePullRequest: PullRequest;
}

export interface MergePullRequestData {
  mergePullRequest: PullRequest;
}

// Mutation Variables
export interface CreateRepoVariables {
  input: CreateRepoInput;
}

export interface UpdateRepoVariables {
  input: UpdateRepoInput;
}

export interface SetVisibilityVariables {
  id: string;
  isPrivate: boolean;
}

export interface CreateBranchVariables {
  input: CreateBranchInput;
}

export interface UpdateBranchVariables {
  input: UpdateBranchInput;
}

export interface SetBranchProtectionVariables {
  id: string;
  isProtected: boolean;
  rules?: BranchProtectionRulesInput;
}

export interface CreateIssueVariables {
  input: CreateIssueInput;
}

export interface UpdateIssueVariables {
  input: UpdateIssueInput;
}

export interface AssignIssueVariables {
  issueId: string;
  assigneeId: string;
}

export interface UnassignIssueVariables {
  issueId: string;
  assigneeId: string;
}

export interface AddLabelVariables {
  id: string;
  label: string;
}

export interface RemoveLabelVariables {
  id: string;
  label: string;
}

export interface ChangeIssueStateVariables {
  issueId: string;
  state: string;
}

export interface CreatePullRequestVariables {
  input: CreatePullRequestInput;
}

export interface UpdatePullRequestVariables {
  input: UpdatePullRequestInput;
}

export interface MergePullRequestVariables {
  id: string;
}

export interface UpdateUserInput {
  id: string;
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
}

export interface UpdateUserData {
  updateUser: User;
}

export interface UpdateUserVariables {
  input: UpdateUserInput;
}