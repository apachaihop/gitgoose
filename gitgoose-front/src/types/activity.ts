export type ActivityType = 
  | 'COMMIT'
  | 'PULL_REQUEST'
  | 'ISSUE'
  | 'RELEASE'
  | 'FORK'
  | 'BRANCH'
  | 'COMMENT'
  | 'REVIEW';

export interface Activity {
  id: string;
  type: ActivityType;
  actor: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  timestamp: string;
  payload: {
    title?: string;
    description?: string;
    status?: string;
    sha?: string;
    ref?: string;
    action?: string;
    number?: number;
    url?: string;
  };
}