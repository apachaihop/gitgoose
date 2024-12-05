import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { GqlAuthGuard } from '../auth/gql_auth/gql_auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
@Resolver(() => Comment)
@UseGuards(GqlAuthGuard)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Mutation(() => Comment)
  createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.create({
      ...createCommentInput,
      authorId: user.id,
    });
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

  @Query(() => [Comment])
  commentsByAuthor(@Args('authorId', { type: () => ID }) authorId: string) {
    return this.commentsService.findByAuthor(authorId);
  }

  @Query(() => [Comment])
  commentsByPath(
    @Args('pullRequestId', { type: () => ID }) pullRequestId: string,
    @Args('path') path: string,
  ) {
    return this.commentsService.findByPath(pullRequestId, path);
  }

  @Mutation(() => Comment)
  updateComment(
    @Args('id', { type: () => ID }) id: string,
    @Args('body') body: string,
  ) {
    return this.commentsService.update(id, body);
  }
}
