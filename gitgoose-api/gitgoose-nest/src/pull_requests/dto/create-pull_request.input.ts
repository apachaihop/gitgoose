import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsBoolean,
  IsOptional,
} from 'class-validator';

@InputType()
export class CreatePullRequestInput {
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

  @Field()
  @IsNotEmpty()
  @IsString()
  sourceBranch: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  targetBranch: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}
