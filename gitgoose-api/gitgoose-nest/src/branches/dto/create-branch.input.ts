import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

@InputType()
export class CreateBranchInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  repositoryId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true, defaultValue: 'main' })
  @IsOptional()
  @IsString()
  sourceBranch?: string;
}
