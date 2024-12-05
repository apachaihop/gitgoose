import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class GetActivitiesInput {
  @Field(() => Int, { defaultValue: 7 })
  days?: number;

  @Field(() => Int, { defaultValue: 10 })
  limit?: number;
}
