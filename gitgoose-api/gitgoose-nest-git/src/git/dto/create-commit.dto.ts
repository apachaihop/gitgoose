export class CreateCommitDto {
  repoId: string;
  message: string;
  branch?: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  files: {
    path: string;
    content: string;
  }[];
}
