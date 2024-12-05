import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Repo } from './repo.entity';

@ObjectType()
@Entity()
export class LanguageStats {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  language: string;

  @Field()
  @Column('float')
  percentage: number;

  @Field()
  @Column('numeric', { precision: 20, scale: 2 })
  bytes: number;

  @Field()
  @Column()
  repositoryId: string;

  @Field(() => Repo)
  @ManyToOne(() => Repo, (repo) => repo.languageStatsEntities)
  repository: Repo;
}
