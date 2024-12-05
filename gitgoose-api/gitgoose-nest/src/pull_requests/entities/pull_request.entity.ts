import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Repo } from '../../repos/entities/repo.entity';
import { Comment } from '../../comments/entities/comment.entity';

@ObjectType()
@Entity()
export class PullRequest {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Number)
  @Column()
  number: number;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  body?: string;

  @Field()
  @Column()
  state: 'open' | 'closed';

  @Field()
  @Column()
  sourceBranch: string;

  @Field()
  @Column()
  targetBranch: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isDraft: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  isMerged: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  hasConflicts: boolean;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  mergedAt?: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  mergedById?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'mergedById' })
  mergedBy?: User;

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

  @Field(() => [User])
  @ManyToOne(() => User)
  reviewers: User[];

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.pullRequest)
  comments: Comment[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  closedAt: Date;
}
