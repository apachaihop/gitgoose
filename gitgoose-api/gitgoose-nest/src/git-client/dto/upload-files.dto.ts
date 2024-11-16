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

  @Field(() => [String])
  files: Promise<FileUpload>[];
}
