export interface User {
    id: string;
    username: string;
    avatarUrl?: string;
  }
  
  export interface Repository {
    id: string;
    name: string;
    description: string;
    starsCount: number;
    forksCount: number;
    watchersCount: number;
    updatedAt: string;
    primaryLanguage: string;
    isPrivate: boolean;
    owner: {
      id: string;
      username: string;
    };
    defaultBranch: string;
  }
  
  export interface FileTreeItem {
    path: string;
    type: 'file' | 'directory';
    content?: string;
    size?: number;
    children?: FileTreeItem[];
  }
  
  export interface CreateRepoInput {
    name: string;
    description?: string;
    isPrivate?: boolean;
    defaultBranch?: string;
  }
  
  export interface UpdateRepoInput {
    id: string;
    name?: string;
    description?: string;
    isPrivate?: boolean;
    defaultBranch?: string;
  }
  
  export interface CloneRepositoryInput {
    url: string;
    name: string;
    description?: string;
    isPrivate?: boolean;
    auth?: {
      username: string;
      password: string;
    };
  }