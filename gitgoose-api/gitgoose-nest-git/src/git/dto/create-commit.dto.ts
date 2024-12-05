export interface FileChange {
  path: string;
  content?: string;
  operation: 'add' | 'modify' | 'delete';
}

export class CreateCommitDto {
  repoId: string;
  message: string;
  branch: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  files: FileChange[];
}
