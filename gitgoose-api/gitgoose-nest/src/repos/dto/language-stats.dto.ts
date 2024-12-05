// src/repos/dto/language-stats.dto.ts
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LanguageStats {
  @Field(() => String)
  language: string;

  @Field(() => Number)
  percentage: number;

  @Field(() => Number)
  bytes: number;
}
