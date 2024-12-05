import { Resolver, Mutation, Args, ID, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql_auth/gql_auth.guard';
import { SocialService } from './social.service';
import { Repo } from '../repos/entities/repo.entity';
import { User } from '../auth/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RecommendationService } from '../recommendation/recommendation.service';

@Resolver()
@UseGuards(GqlAuthGuard)
export class SocialResolver {
  constructor(
    private readonly socialService: SocialService,
    private readonly recommendationService: RecommendationService,
  ) {}

  @Mutation(() => Repo)
  async starRepository(
    @Args('repositoryId', { type: () => ID }) repositoryId: string,
    @CurrentUser() user: User,
  ) {
    return this.socialService.starRepository(repositoryId, user.id);
  }

  @Mutation(() => Repo)
  async unstarRepository(
    @Args('repositoryId', { type: () => ID }) repositoryId: string,
    @CurrentUser() user: User,
  ) {
    return this.socialService.unstarRepository(repositoryId, user.id);
  }

  @Mutation(() => Repo)
  async watchRepository(
    @Args('repositoryId', { type: () => ID }) repositoryId: string,
    @CurrentUser() user: User,
  ) {
    return this.socialService.watchRepository(repositoryId, user.id);
  }

  @Mutation(() => Repo)
  async unwatchRepository(
    @Args('repositoryId', { type: () => ID }) repositoryId: string,
    @CurrentUser() user: User,
  ) {
    return this.socialService.unwatchRepository(repositoryId, user.id);
  }

  @Mutation(() => User)
  async followUser(
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() user: User,
  ) {
    return this.socialService.followUser(userId, user.id);
  }

  @Mutation(() => User)
  async unfollowUser(
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() user: User,
  ) {
    return this.socialService.unfollowUser(userId, user.id);
  }

  @Query(() => [Repo])
  async trendingRepos(@CurrentUser() user: User) {
    return this.recommendationService.getTrendingReposForUser(user.id);
  }
}
