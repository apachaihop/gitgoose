export interface PullRequest {
  id: string;
  title: string;
  state: string;
  isMerged: boolean;
  number: number;
  sourceBranch: string;
  targetBranch: string;
  author: {
    id: string;
    username: string;
  };
  reviewers: {
    id: string;
    username: string;
  }[];
  comments: {
    id: string;
    body: string;
    author: {
      username: string;
    };
  }[];
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
  state?: string;
}