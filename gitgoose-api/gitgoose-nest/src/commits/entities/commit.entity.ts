import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Repo } from '../../repos/entities/repo.entity';

@ObjectType()
@Entity()
export class Commit {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  sha: string;

  @Field()
  @Column()
  message: string;

  @Field()
  @Column()
  authorName: string;

  @Field()
  @Column()
  authorEmail: string;

  @Field(() => ID)
  @Column()
  authorId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Field(() => ID)
  @Column()
  repositoryId: string;

  @Field(() => Repo)
  @ManyToOne(() => Repo)
  @JoinColumn({ name: 'repositoryId' })
  repository: Repo;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => [String])
  @Column('simple-array')
  parentShas: string[];

  @Field(() => Boolean)
  @Column({ default: false })
  isMergeCommit: boolean;
}
