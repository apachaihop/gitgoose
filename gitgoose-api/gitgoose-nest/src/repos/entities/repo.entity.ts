import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { PullRequest } from '../../pull_requests/entities/pull_request.entity';
import { Issue } from '../../issues/entities/issue.entity';
import { Branch } from '../../branches/entities/branch.entity';

@ObjectType()
@Entity()
export class Repo {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column({ default: false })
  isPrivate: boolean;

  @Field()
  @Column()
  defaultBranch: string;

  @Field()
  @Column()
  ownerId: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.repositories)
  owner: User;

  @Field()
  @Column()
  path: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ default: 0 })
  starsCount: number;

  @Field()
  @Column({ default: 0 })
  forksCount: number;

  @Field()
  @Column({ default: false })
  isFork: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  forkedFromId?: string;

  @Field(() => Repo, { nullable: true })
  @ManyToOne(() => Repo, { nullable: true })
  forkedFrom?: Repo;

  @Field(() => [PullRequest])
  @OneToMany(() => PullRequest, (pr) => pr.repository)
  pullRequests: PullRequest[];

  @Field(() => [Issue])
  @OneToMany(() => Issue, (issue) => issue.repository)
  issues: Issue[];

  @Field(() => [Branch])
  @OneToMany(() => Branch, (branch) => branch.repository)
  branches: Branch[];
}
