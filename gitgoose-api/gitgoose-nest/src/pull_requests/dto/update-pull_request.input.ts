import { CreatePullRequestInput } from './create-pull_request.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdatePullRequestInput extends PartialType(
  CreatePullRequestInput,
) {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  state?: string;
}
