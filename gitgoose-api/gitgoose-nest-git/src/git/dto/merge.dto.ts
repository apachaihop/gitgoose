export interface MergeDto {
  repoId: string;
  sourceBranch: string;
  targetBranch: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
}
