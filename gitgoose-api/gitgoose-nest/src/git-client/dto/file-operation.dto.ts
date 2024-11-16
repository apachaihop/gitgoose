import { IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { FileOperation } from './file-operation.enum';

export class FileOperationDto {
  @IsNotEmpty()
  @IsUUID()
  repoId: string;

  @IsNotEmpty()
  @IsEnum(FileOperation)
  operation: FileOperation;

  path?: string;

  content?: string;

  branch?: string;
}
