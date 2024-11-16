import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { GqlAuthGuard } from '../auth/gql_auth/gql_auth.guard';

@Resolver(() => Comment)
@UseGuards(GqlAuthGuard)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Mutation(() => Comment)
  createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
  ) {
    return this.commentsService.create(createCommentInput);
  }

  @Query(() => [Comment])
  commentsByPullRequest(
    @Args('pullRequestId', { type: () => ID }) pullRequestId: string,
  ) {
    return this.commentsService.findByPullRequest(pullRequestId);
  }

  @Mutation(() => Comment)
  resolveComment(@Args('id', { type: () => ID }) id: string) {
    return this.commentsService.resolve(id);
  }

  @Mutation(() => Comment)
  removeComment(@Args('id', { type: () => ID }) id: string) {
    return this.commentsService.remove(id);
  }
}
