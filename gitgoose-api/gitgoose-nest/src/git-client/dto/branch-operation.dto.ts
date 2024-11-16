export class BranchOperationDto {
  repoId: string;
  operation: 'checkout' | 'delete' | 'merge';
  branch?: string;
  sourceBranch?: string;
  targetBranch?: string;
}
