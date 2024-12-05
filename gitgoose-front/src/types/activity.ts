export interface Activity {
    id: string;
    type: ActivityType;
    createdAt: string;
    actor: {
      id: string;
      username: string;
      avatarUrl?: string;
    };
    targetRepo?: {
      id: string;
      name: string;
      path: string;
      owner: {
        id: string;
        username: string;
        avatarUrl?: string;
      };
    };
    targetUser?: {
      id: string;
      username: string;
      avatarUrl?: string;
    };
  }

export type ActivityType =
  | "REPO_CREATE"
  | "REPO_DELETE"
  | "REPO_UPDATE"
  | "PR_CREATE"
  | "PR_MERGE"
  | "PR_CLOSE"
  | "ISSUE_CREATE"
  | "ISSUE_CLOSE"
  | "ISSUE_REOPEN"
  | "ISSUE_ASSIGN"
  | "ISSUE_UNASSIGN"
  | "ISSUE_LABEL_ADD"
  | "ISSUE_LABEL_REMOVE"
  | "STAR_REPO"
  | "UNSTAR_REPO"
  | "FOLLOW_USER"
  | "UNFOLLOW_USER";