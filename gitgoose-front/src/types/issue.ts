export type IssueState = 'OPEN' | 'CLOSED';
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface IssueLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  state: IssueState;
  priority: IssuePriority;
  number: number;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  assignees: {
    id: string;
    name: string;
    avatarUrl: string;
  }[];
  labels: IssueLabel[];
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
}