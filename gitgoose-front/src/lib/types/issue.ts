export interface Issue {
    id: string;
    title: string;
    body: string;
    state: string;
    labels: string[];
    author: {
      username: string;
    };
    assignees: {
      username: string;
    }[];
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
    state?: string;
  }