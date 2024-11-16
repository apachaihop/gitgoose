import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateBranchInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  repositoryId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  lastCommitSha: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  lastCommitMessage: string;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  lastCommitAuthorId: string;
}
