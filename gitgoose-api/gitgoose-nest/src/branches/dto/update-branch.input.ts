import { CreateBranchInput } from './create-branch.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsUUID, IsBoolean } from 'class-validator';

@InputType()
export class UpdateBranchInput extends PartialType(CreateBranchInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsBoolean()
  isProtected?: boolean;
}
