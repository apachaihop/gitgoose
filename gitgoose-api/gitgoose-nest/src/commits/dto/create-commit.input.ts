import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
class FileInput {
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
export class CreateCommitInput {
  @Field(() => ID)
  @IsUUID()
  repositoryId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  message: string;

  @Field()
  @IsString()
  branch: string;

  @Field(() => ID)
  @IsUUID()
  authorId: string;

  @Field()
  @IsString()
  authorName: string;

  @Field()
  @IsString()
  authorEmail: string;

  @Field(() => [FileInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileInput)
  files: FileInput[];
}
