import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  authorId: string;
}
