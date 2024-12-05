import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { FileOperation } from './file-operation.enum';

export class FileOperationDto {
  @IsNotEmpty()
  @IsUUID()
  repoId: string;

  @IsNotEmpty()
  @IsEnum(FileOperation)
  operation: FileOperation;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  branch?: string;
}
