import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FileChange {
  @Field()
  path: string;

  @Field()
  content: string;

  @Field()
  operation: 'add' | 'modify' | 'delete';
}
