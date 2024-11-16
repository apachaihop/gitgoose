import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  emailNotificationsEnabled?: boolean;

  @Field({ nullable: true })
  preferences?: Record<string, any>;
}
