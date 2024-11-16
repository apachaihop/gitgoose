export class CreateBranchDto {
  repoId: string;
  name: string;
  startPoint?: string; // SHA or branch name to start from
}
