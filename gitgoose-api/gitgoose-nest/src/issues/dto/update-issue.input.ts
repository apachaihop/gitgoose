import { CreateIssueInput } from './create-issue.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateIssueInput extends PartialType(CreateIssueInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  state?: string;
}
