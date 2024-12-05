import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Stream } from 'stream';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}

@InputType()
export class FileChangeInput {
  @Field()
  @IsString()
  path: string;

  @Field()
  @IsString()
  content: string;

  @Field()
  @IsString()
  operation: 'add' | 'modify' | 'delete';
}

@InputType()
export class UploadFilesInput {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  repositoryId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  branch: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  commitMessage: string;

  @Field(() => [FileChangeInput])
  files: FileChangeInput[];
}
