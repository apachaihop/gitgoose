export interface Repository {
    id: string;
    name: string;
    description?: string;
    isPrivate: boolean;
    defaultBranch: string;
    owner: {
      id: string;
      name: string;
    };
    updatedAt: string;
    createdAt: string;
  }
  
  export interface CreateRepositoryInput {
    name: string;
    description?: string;
    isPrivate: boolean;
    defaultBranch: string;
  }