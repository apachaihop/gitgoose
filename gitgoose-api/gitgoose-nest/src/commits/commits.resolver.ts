import { GqlAuthGuard } from './../auth/gql_auth/gql_auth.guard';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommitsService } from './commits.service';
import { Commit } from './entities/commit.entity';
import { CreateCommitInput } from './dto/create-commit.input';

@Resolver(() => Commit)
@UseGuards(GqlAuthGuard)
export class CommitsResolver {
  constructor(private readonly commitsService: CommitsService) {}

  @Mutation(() => Commit)
  createCommit(
    @Args('createCommitInput') createCommitInput: CreateCommitInput,
  ) {
    return this.commitsService.create(createCommitInput);
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
}
