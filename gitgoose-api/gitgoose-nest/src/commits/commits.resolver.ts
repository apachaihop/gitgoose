import { GqlAuthGuard } from './../auth/gql_auth/gql_auth.guard';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommitsService } from './commits.service';
import { Commit } from './entities/commit.entity';
import { CreateCommitInput } from './dto/create-commit.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@Resolver(() => Commit)
@UseGuards(GqlAuthGuard)
export class CommitsResolver {
  constructor(private readonly commitsService: CommitsService) {}

  @Mutation(() => Commit)
  createCommit(
    @Args('createCommitInput') createCommitInput: CreateCommitInput,
    @CurrentUser() user: User,
  ) {
    return this.commitsService.create({
      ...createCommitInput,
      authorId: user.id,
    });
  }

  @Query(() => [Commit], { name: 'commits' })
  findAll() {
    return this.commitsService.findAll();
  }

  @Query(() => Commit, { name: 'commit' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.commitsService.findOne(id);
  }

  @Query(() => [Commit], { name: 'commitsByRepository' })
  findByRepository(
    @Args('repositoryId', { type: () => ID }) repositoryId: string,
  ) {
    return this.commitsService.findByRepository(repositoryId);
  }

  @Query(() => Commit, { name: 'commitBySha' })
  findBySha(
    @Args('repositoryId', { type: () => ID }) repositoryId: string,
    @Args('sha') sha: string,
  ) {
    return this.commitsService.findBySha(repositoryId, sha);
  }

  @Query(() => [Commit])
  commitsByAuthor(@Args('authorId', { type: () => ID }) authorId: string) {
    return this.commitsService.findByAuthor(authorId);
  }

  @Query(() => [Commit])
  commitsByBranch(
    @Args('repositoryId', { type: () => ID }) repositoryId: string,
    @Args('branchName') branchName: string,
  ) {
    return this.commitsService.findByBranch(repositoryId, branchName);
  }

  @Query(() => Commit)
  latestCommit(
    @Args('repositoryId', { type: () => ID }) repositoryId: string,
    @Args('branchName', { nullable: true }) branchName?: string,
  ) {
    return this.commitsService.findLatest(repositoryId, branchName);
  }
}
