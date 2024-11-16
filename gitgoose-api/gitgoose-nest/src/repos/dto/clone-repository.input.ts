import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AuthInput {
  @Field()
  username: string;

  @Field()
  password: string;
}
@InputType()
export class CloneRepositoryInput {
  @Field()
  url: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ defaultValue: false })
  isPrivate: boolean;

  @Field(() => AuthInput, { nullable: true })
  auth?: AuthInput;
}
