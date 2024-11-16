export interface RepositorySettings {
    name: string;
    description?: string;
    isPrivate: boolean;
    defaultBranch: string;
    allowMergeCommits: boolean;
    allowSquashMerging: boolean;
    allowRebaseMerging: boolean;
    deleteBranchOnMerge: boolean;
    enableIssues: boolean;
    enableProjects: boolean;
    enableDiscussions: boolean;
    requireApprovalForMerge: boolean;
    requiredApprovalsCount: number;
    webhooks: Webhook[];
    collaborators: Collaborator[];
  }
  
  export interface Webhook {
    id: string;
    url: string;
    contentType: 'json' | 'form';
    secret?: string;
    active: boolean;
    events: string[];
  }
  
  export interface Collaborator {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string;
    };
    role: 'ADMIN' | 'MAINTAIN' | 'WRITE' | 'TRIAGE' | 'READ';
    permissions: string[];
  }