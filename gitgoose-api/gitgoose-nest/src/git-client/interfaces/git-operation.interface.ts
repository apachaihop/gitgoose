export interface CommitInfo {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  timestamp: number;
}
