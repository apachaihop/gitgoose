export interface FileTreeRequestDto {
  repoId: string;
  path?: string;
  branch?: string;
}

export interface FileTreeItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeItem[];
}
