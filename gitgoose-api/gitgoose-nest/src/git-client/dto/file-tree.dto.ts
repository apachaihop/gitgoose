export interface FileTreeItem {
  path: string;
  type: 'file' | 'directory';
  content?: string;
  size?: number;
}

export class FileTreeRequestDto {
  repoId: string;
  ref?: string; // branch name or commit SHA
  path?: string; // optional path to get specific directory/file
}
