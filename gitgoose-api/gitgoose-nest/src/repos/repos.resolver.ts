import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ReposService } from './repos.service';
import { Repo } from './entities/repo.entity';
import { CreateRepoInput } from './dto/create-repo.input';
import { UpdateRepoInput } from './dto/update-repo.input';
import { CloneRepositoryInput } from './dto/clone-repository.input';
import { GqlAuthGuard } from '../auth/gql_auth/gql_auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { LanguageStats } from './entities/language-stats.entity';
import { GraphQLJSON } from 'graphql-type-json';

@Resolver(() => Repo)
@UseGuards(GqlAuthGuard)
export class ReposResolver {
  constructor(private readonly reposService: ReposService) {}

  @Mutation(() => Repo)
  createRepo(
    @Args('createRepoInput') createRepoInput: CreateRepoInput,
    @CurrentUser() user: User,
  ) {
    return this.reposService.create({ ...createRepoInput, ownerId: user.id });
  }

  @Query(() => [Repo], { name: 'repos' })
  findAll() {
    return this.reposService.findAll();
  }

  @Query(() => Repo, { name: 'repo' })
  findOne(@Args('id') id: string) {
    return this.reposService.findOne(id);
  }

  @Mutation(() => Repo)
  updateRepo(@Args('updateRepoInput') updateRepoInput: UpdateRepoInput) {
    return this.reposService.update(updateRepoInput.id, updateRepoInput);
  }

  @Mutation(() => Repo)
  removeRepo(@Args('id') id: string) {
    return this.reposService.remove(id);
  }

  @Mutation(() => Repo)
  async cloneRepository(
    @Args('input') input: CloneRepositoryInput,
    @CurrentUser() user: User,
  ) {
    return this.reposService.cloneRepository({
      ...input,
      ownerId: user.id,
    });
  }

  @Query(() => String)
  async getCloneUrl(@Args('id', { type: () => ID }) id: string) {
    return this.reposService.getCloneUrl(id);
  }

  @Query(() => [Repo])
  reposByOwner(@Args('ownerId', { type: () => ID }) ownerId: string) {
    return this.reposService.findByOwner(ownerId);
  }

  @Mutation(() => Repo)
  setVisibility(
    @Args('id', { type: () => ID }) id: string,
    @Args('isPrivate', { type: () => Boolean }) isPrivate: boolean,
  ) {
    return this.reposService.setVisibility(id, isPrivate);
  }

  @Mutation(() => Repo)
  setDefaultBranch(
    @Args('id', { type: () => ID }) id: string,
    @Args('branchName') branchName: string,
  ) {
    return this.reposService.setDefaultBranch(id, branchName);
  }

  @Query(() => Boolean)
  async checkPermission(
    @Args('repoId', { type: () => ID }) repoId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @Args('permission') permission: string,
  ) {
    return this.reposService.checkPermission(repoId, userId, permission);
  }

  @Query(() => Repo, { name: 'repoByPath' })
  async findRepoByPath(
    @Args('owner', { type: () => ID }) ownerId: string,
    @Args('name') name: string,
  ) {
    const path = `${ownerId}/${name}`;
    return this.reposService.findByPath(path);
  }

  @Query(() => [User])
  repositoryCollaborators(
    @Args('repositoryId', { type: () => ID }) repositoryId: string,
  ) {
    return this.reposService.getCollaborators(repositoryId);
  }

  @Query(() => [Repo], { name: 'userRepositories' })
  async userRepositories(@Args('username') username: string) {
    return this.reposService.findByUsername(username);
  }

  @Query(() => [LanguageStats])
  async repositoryLanguages(@Args('id', { type: () => ID }) id: string) {
    const repo = await this.reposService.findOne(id);
    const languageStats = await this.reposService.getLanguageStats(id);
    return languageStats;
  }

  @ResolveField('languageStats', () => GraphQLJSON)
  async getLanguageStats(@Parent() repo: Repo) {
    const stats = await this.reposService.getLanguageStats(repo.id);
    return stats.reduce((acc, stat) => {
      acc[stat.language] = {
        percentage: stat.percentage,
        bytes: stat.bytes,
      };
      return acc;
    }, {});
  }
}
