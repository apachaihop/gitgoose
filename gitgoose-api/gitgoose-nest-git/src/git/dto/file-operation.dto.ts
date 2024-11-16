export type FileOperationType = 'read' | 'write' | 'delete' | 'list';

export class FileOperationDto {
  repoId: string;
  operation: FileOperationType;
  path: string;
  branch?: string;
  content?: string;
}
