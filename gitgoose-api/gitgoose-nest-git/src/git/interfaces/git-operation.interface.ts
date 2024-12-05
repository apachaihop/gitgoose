export interface GitOperation {
  type: 'init' | 'clone' | 'commit' | 'push' | 'pull' | 'branch' | 'checkout';
  repoId: string;
  payload?: any;
}

export interface CommitInfo {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  parentShas: string[];
  timestamp: number;
}

export interface BranchInfo {
  name: string;
  sha: string;
  isHead: boolean;
}

export interface FileInfo {
  path: string;
  type: 'file' | 'tree';
}

export interface FileOperationResult {
  content?: string;
  files?: FileInfo[];
}

export interface PackFileResult {
  packfile: Buffer;
}

export interface PackFileRequest {
  repoId: string;
  wants?: string[];
}
