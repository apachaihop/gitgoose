export interface Commit {
    id: string;
    sha: string;
    message: string;
    authorName: string;
    authorEmail?: string;
  }
  
  export interface FileOperation {
    path: string;
    content: string;
    operation: 'add' | 'update' | 'delete';
  }
  
  export interface CreateCommitInput {
    repositoryId: string;
    message: string;
    branch: string;
    authorId: string;
    authorName: string;
    authorEmail: string;
    files: FileOperation[];
  }