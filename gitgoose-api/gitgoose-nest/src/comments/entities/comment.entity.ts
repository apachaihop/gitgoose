import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { PullRequest } from '../../pull_requests/entities/pull_request.entity';

@ObjectType()
@Entity()
export class Comment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('text')
  body: string;

  @Field(() => ID)
  @Column()
  authorId: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Field(() => ID)
  @Column()
  pullRequestId: string;

  @Field(() => PullRequest)
  @ManyToOne(() => PullRequest)
  @JoinColumn({ name: 'pullRequestId' })
  pullRequest: PullRequest;

  @Field({ nullable: true })
  @Column({ nullable: true })
  path?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lineNumber?: number;

  @Field(() => Boolean)
  @Column({ default: false })
  isResolved: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
