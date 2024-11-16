export interface CreateRepoInput {
    name: string;
    description?: string;
    isPrivate: boolean;
    defaultBranch: string;
  }
  
  export interface FileTreeRequestDto {
    repoId: string;
    ref?: string;
    path?: string;
  }
  
  export interface CreatePullRequestInput {
    title: string;
    body: string;
    sourceBranch: string;
    targetBranch: string;
    repositoryId: string;
    reviewerIds?: string[];
  }
  
  export interface UploadFilesInput {
    repositoryId: string;
    branch: string;
    commitMessage: string;
    files: FileUpload[];
  }
  
  export interface FileUpload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => any; // Stream type needs to be properly defined
  }
  
  // Response Types
  export interface LoginResponse {
    access_token: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
  
  export interface FileTreeItem {
    path: string;
    type: 'file' | 'directory';
    content?: string;
    size?: number;
  }