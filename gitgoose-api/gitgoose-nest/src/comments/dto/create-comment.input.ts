import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
} from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  body: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  pullRequestId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  authorId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  path?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  lineNumber?: number;
}
