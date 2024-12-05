import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';

@InputType()
export class CreateRepoInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isPrivate: boolean;

  @Field({ defaultValue: 'main' })
  @IsString()
  defaultBranch: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  ownerId: string;
}
