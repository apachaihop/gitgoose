import { CreateRepoInput } from './create-repo.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateRepoInput extends PartialType(CreateRepoInput) {
  @Field()
  id: string;
}
