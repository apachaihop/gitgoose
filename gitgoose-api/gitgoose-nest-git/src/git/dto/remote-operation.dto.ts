export class RemoteOperationDto {
  repoId: string;
  branch?: string;
  remote?: string;
  url?: string;
  auth?: {
    username: string;
    password: string;
  };
}
