export interface FileTreeItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeItem[];
}
export interface FileTreeRequestDto {
  repoId: string;
  path?: string;
  ref?: string;
}
