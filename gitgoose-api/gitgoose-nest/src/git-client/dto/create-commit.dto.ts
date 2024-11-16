import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsArray,
  IsOptional,
} from 'class-validator';

export class FileChange {
  @IsNotEmpty()
  @IsString()
  path: string;

  @IsOptional()
  content?: string;

  @IsNotEmpty()
  @IsString()
  operation: 'add' | 'modify' | 'delete';
}

export class CreateCommitDto {
  @IsNotEmpty()
  @IsUUID()
  repoId: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  branch: string;

  @IsNotEmpty()
  @IsUUID()
  authorId: string;

  @IsNotEmpty()
  @IsString()
  authorName: string;

  @IsOptional()
  @IsString()
  authorEmail?: string;

  @IsNotEmpty()
  @IsArray()
  files: FileChange[];
}
