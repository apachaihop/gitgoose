import { ObjectType, Field, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Repo } from '../../repos/entities/repo.entity';
import { Issue } from '../../issues/entities/issue.entity';
import { Branch } from '../../branches/entities/branch.entity';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column()
  username: string;

  @Column()
  password: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatarUrl?: string;

  @Field(() => [Repo])
  @OneToMany(() => Repo, (repo) => repo.owner)
  repositories: Repo[];

  @Field(() => [Repo])
  @ManyToMany(() => Repo)
  @JoinTable({
    name: 'user_starred_repos',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'repo_id', referencedColumnName: 'id' },
  })
  starredRepositories: Repo[];

  @Field(() => [User])
  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_followers',
    joinColumn: { name: 'following_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'follower_id', referencedColumnName: 'id' },
  })
  followers: User[];

  @Field(() => [User])
  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_following',
    joinColumn: { name: 'follower_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'following_id', referencedColumnName: 'id' },
  })
  following: User[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isAdmin: boolean;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field(() => [String])
  @Column('simple-array', { default: '' })
  roles: string[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  googleId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  githubId?: string;

  @Field()
  @Column({ default: true })
  emailNotificationsEnabled: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'json', nullable: true })
  preferences?: Record<string, any>;

  @Field()
  @Column({ default: 0 })
  publicReposCount: number;

  @Field()
  @Column({ default: 0 })
  privateReposCount: number;

  @Field()
  @Column({ default: 0 })
  followersCount: number;

  @Field()
  @Column({ default: 0 })
  followingCount: number;

  @Field(() => [Issue])
  @ManyToMany(() => Issue, (issue) => issue.assignees)
  assignedIssues: Issue[];

  @Field(() => [Branch])
  @OneToMany(() => Branch, (branch) => branch.lastCommitAuthor)
  branchCommits: Branch[];

  async addFollower(user: User) {
    if (this.followers === undefined) {
      this.followers = [];
    }
    this.followers.push(user);
    this.followersCount++;
  }

  async addFollowing(user: User) {
    if (this.following === undefined) {
      this.following = [];
    }
    this.following.push(user);
    this.followingCount++;
  }

  async starRepository(repo: Repo) {
    if (this.starredRepositories === undefined) {
      this.starredRepositories = [];
    }
    this.starredRepositories.push(repo);
  }

  isFollowing(userId: string): boolean {
    return this.following?.some((user) => user.id === userId) ?? false;
  }

  hasStarred(repoId: string): boolean {
    return (
      this.starredRepositories?.some((repo) => repo.id === repoId) ?? false
    );
  }
}
