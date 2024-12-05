import { registerEnumType } from '@nestjs/graphql';

export enum ActivityType {
  REPO_CREATE = 'REPO_CREATE',
  REPO_DELETE = 'REPO_DELETE',
  REPO_UPDATE = 'REPO_UPDATE',
  PR_CREATE = 'PR_CREATE',
  PR_MERGE = 'PR_MERGE',
  PR_CLOSE = 'PR_CLOSE',
  ISSUE_CREATE = 'ISSUE_CREATE',
  ISSUE_CLOSE = 'ISSUE_CLOSE',
  ISSUE_REOPEN = 'ISSUE_REOPEN',
  ISSUE_ASSIGN = 'ISSUE_ASSIGN',
  ISSUE_UNASSIGN = 'ISSUE_UNASSIGN',
  ISSUE_LABEL_ADD = 'ISSUE_LABEL_ADD',
  ISSUE_LABEL_REMOVE = 'ISSUE_LABEL_REMOVE',
}

registerEnumType(ActivityType, {
  name: 'ActivityType',
  description: 'The type of activity that occurred',
});
