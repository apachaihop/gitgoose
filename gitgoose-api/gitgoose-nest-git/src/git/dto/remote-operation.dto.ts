export class RemoteOperationDto {
  repoId: string;
  url?: string;
  remote?: string;
  branch?: string;
  auth?: {
    username: string;
    password: string;
  };
}
