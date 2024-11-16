export interface PullRequest {
    id: string;
    title: string;
    description: string;
    sourceBranch: string;
    targetBranch: string;
    state: 'OPEN' | 'CLOSED' | 'MERGED';
    author: {
      id: string;
      name: string;
      avatarUrl: string;
    };
    reviewers: {
      id: string;
      name: string;
      avatarUrl: string;
    }[];
    createdAt: string;
    updatedAt: string;
    comments: number;
    commits: number;
    additions: number;
    deletions: number;
  }