import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { PullRequestsService } from './pull_requests.service';
import { PullRequest } from './entities/pull_request.entity';
import { CreatePullRequestInput } from './dto/create-pull_request.input';
import { UpdatePullRequestInput } from './dto/update-pull_request.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql_auth/gql_auth.guard';

@Resolver(() => PullRequest)
@UseGuards(GqlAuthGuard)
export class PullRequestsResolver {
  constructor(private readonly pullRequestsService: PullRequestsService) {}

  @Mutation(() => PullRequest)
  createPullRequest(
    @Args('createPullRequestInput')
    createPullRequestInput: CreatePullRequestInput,
  ) {
    return this.pullRequestsService.create(createPullRequestInput);
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
    @Context() context: any,
  ) {
    return this.pullRequestsService.merge(id, context.req.user.id);
  }

  @Mutation(() => PullRequest)
  removePullRequest(@Args('id', { type: () => ID }) id: string) {
    return this.pullRequestsService.remove(id);
  }
}
