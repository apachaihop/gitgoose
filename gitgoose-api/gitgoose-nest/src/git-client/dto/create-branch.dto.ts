import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty()
  @IsUUID()
  repoId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  sourceBranch: string;
}
