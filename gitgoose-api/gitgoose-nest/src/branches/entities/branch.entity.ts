import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Repo } from '../../repos/entities/repo.entity';
import { User } from '../../auth/entities/user.entity';

@ObjectType()
export class BranchProtectionRules {
  @Field(() => Boolean)
  requirePullRequest: boolean;

  @Field(() => Number)
  requiredReviewers: number;

  @Field(() => Boolean)
  requireStatusChecks: boolean;
}

@ObjectType()
@Entity()
export class Branch {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  lastCommitSha: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  lastCommitMessage: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  lastCommitAuthorId: string;

  @Field(() => BranchProtectionRules, { nullable: true })
  @Column('jsonb', { nullable: true })
  protectionRules: BranchProtectionRules;

  @ManyToOne(() => Repo, (repo) => repo.branches, {
    onDelete: 'CASCADE',
  })
  @Field(() => Repo)
  repository: Repo;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  lastCommitAuthor: User;

  @Field()
  @Column()
  repositoryId: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isProtected: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
