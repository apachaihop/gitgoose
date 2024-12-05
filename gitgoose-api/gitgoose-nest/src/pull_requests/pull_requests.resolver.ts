import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PullRequestsService } from './pull_requests.service';
import { PullRequest } from './entities/pull_request.entity';
import { CreatePullRequestInput } from './dto/create-pull_request.input';
import { UpdatePullRequestInput } from './dto/update-pull_request.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql_auth/gql_auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@Resolver(() => PullRequest)
@UseGuards(GqlAuthGuard)
export class PullRequestsResolver {
  constructor(private readonly pullRequestsService: PullRequestsService) {}

  @Mutation(() => PullRequest)
  createPullRequest(
    @Args('createPullRequestInput')
    createPullRequestInput: CreatePullRequestInput,
    @CurrentUser() user: User,
  ) {
    return this.pullRequestsService.create({
      ...createPullRequestInput,
      authorId: user.id,
    });
  }

  @Query(() => [PullRequest], { name: 'pullRequests' })
  findAll() {
    return this.pullRequestsService.findAll();
  }

  @Query(() => PullRequest, { name: 'pullRequest' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.pullRequestsService.findOne(id);
  }

  @Query(() => [PullRequest], { name: 'pullRequestsByRepository' })
  findByRepository(
    @Args('repositoryId', { type: () => ID }) repositoryId: string,
  ) {
    return this.pullRequestsService.findByRepository(repositoryId);
  }

  @Mutation(() => PullRequest)
  updatePullRequest(
    @Args('updatePullRequestInput')
    updatePullRequestInput: UpdatePullRequestInput,
  ) {
    return this.pullRequestsService.update(
      updatePullRequestInput.id,
      updatePullRequestInput,
    );
  }

  @Mutation(() => PullRequest)
  mergePullRequest(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.pullRequestsService.merge(id, user.id);
  }

  @Mutation(() => PullRequest)
  removePullRequest(@Args('id', { type: () => ID }) id: string) {
    return this.pullRequestsService.remove(id);
  }

  @Mutation(() => PullRequest)
  addReviewer(
    @Args('pullRequestId', { type: () => ID }) pullRequestId: string,
    @Args('reviewerId', { type: () => ID }) reviewerId: string,
  ) {
    return this.pullRequestsService.addReviewer(pullRequestId, reviewerId);
  }

  @Mutation(() => PullRequest)
  removeReviewer(
    @Args('pullRequestId', { type: () => ID }) pullRequestId: string,
    @Args('reviewerId', { type: () => ID }) reviewerId: string,
  ) {
    return this.pullRequestsService.removeReviewer(pullRequestId, reviewerId);
  }

  @Query(() => [PullRequest])
  pullRequestsByAuthor(@Args('authorId', { type: () => ID }) authorId: string) {
    return this.pullRequestsService.findByAuthor(authorId);
  }

  @Query(() => [PullRequest])
  pullRequestsByReviewer(
    @Args('reviewerId', { type: () => ID }) reviewerId: string,
  ) {
    return this.pullRequestsService.findByReviewer(reviewerId);
  }
}
