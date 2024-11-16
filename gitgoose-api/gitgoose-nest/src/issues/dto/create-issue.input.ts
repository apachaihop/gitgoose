import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateIssueInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  body: string;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  repositoryId: string;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  authorId: string;
}
