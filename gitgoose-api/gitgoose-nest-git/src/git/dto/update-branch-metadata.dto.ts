import { CommitInfo } from '../interfaces/git-operation.interface';

export interface UpdateBranchMetadataDto {
  repoId: string;
  branch: string;
  lastCommit: CommitInfo;
}
