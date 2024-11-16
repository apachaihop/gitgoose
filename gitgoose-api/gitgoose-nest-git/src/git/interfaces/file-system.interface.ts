export interface FileSystem {
  path: string;
  content?: string;
  type: 'file' | 'directory';
  children?: FileSystem[];
}

export interface FileOperation {
  type: 'read' | 'write' | 'delete' | 'list';
  path: string;
  content?: string;
}
