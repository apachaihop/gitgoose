import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { PullRequest } from '../../pull_requests/entities/pull_request.entity';
import { Issue } from '../../issues/entities/issue.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { RepoCollaborator } from './repo_collaborator.entity';
import { Commit } from '../../commits/entities/commit.entity';
import { GraphQLJSON } from 'graphql-type-json';
import { LanguageStats } from './language-stats.entity';
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
  @Column({ nullable: false })
  ownerId: string;

  @Field(() => User)
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'ownerId' })
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

  @Field(() => Number)
  @Column({ default: 0 })
  watchersCount: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  primaryLanguage: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', { nullable: true })
  languageStats: any;

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

  @OneToMany(() => RepoCollaborator, (collaborator) => collaborator.repository)
  collaborators: RepoCollaborator[];

  @Field(() => [Commit])
  @OneToMany(() => Commit, (commit) => commit.repository)
  commits: Commit[];

  @Field(() => Boolean)
  isStarredByViewer: boolean;

  @Field(() => Boolean)
  isWatchedByViewer: boolean;

  @Field(() => [LanguageStats], { nullable: true })
  @OneToMany(() => LanguageStats, (stats) => stats.repository)
  languageStatsEntities: LanguageStats[];

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.starredRepositories)
  stargazers: User[];
}
