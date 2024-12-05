import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { IssuesService } from './issues.service';
import { Issue } from './entities/issue.entity';
import { CreateIssueInput } from './dto/create-issue.input';
import { UpdateIssueInput } from './dto/update-issue.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql_auth/gql_auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
@Resolver(() => Issue)
@UseGuards(GqlAuthGuard)
export class IssuesResolver {
  constructor(private readonly issuesService: IssuesService) {}

  @Mutation(() => Issue)
  createIssue(
    @Args('createIssueInput') createIssueInput: CreateIssueInput,
    @CurrentUser() user: User,
  ) {
    return this.issuesService.create({
      ...createIssueInput,
      authorId: user.id,
    });
  }

  @Query(() => [Issue], { name: 'issues' })
  findAll() {
    return this.issuesService.findAll();
  }

  @Query(() => Issue, { name: 'issue' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.issuesService.findOne(id);
  }

  @Mutation(() => Issue)
  updateIssue(@Args('updateIssueInput') updateIssueInput: UpdateIssueInput) {
    return this.issuesService.update(updateIssueInput.id, updateIssueInput);
  }

  @Mutation(() => Issue)
  removeIssue(@Args('id', { type: () => ID }) id: string) {
    return this.issuesService.remove(id);
  }

  @Mutation(() => Issue)
  addLabel(
    @Args('id', { type: () => ID }) id: string,
    @Args('label', { type: () => String }) label: string,
  ) {
    return this.issuesService.addLabel(id, label);
  }

  @Mutation(() => Issue)
  removeLabel(
    @Args('id', { type: () => ID }) id: string,
    @Args('label', { type: () => String }) label: string,
  ) {
    return this.issuesService.removeLabel(id, label);
  }

  @Query(() => [Issue])
  issuesByAuthor(@Args('authorId', { type: () => ID }) authorId: string) {
    return this.issuesService.findByAuthor(authorId);
  }

  @Query(() => [Issue])
  issuesByRepository(
    @Args('repositoryId', { type: () => ID }) repositoryId: string,
  ) {
    return this.issuesService.findByRepository(repositoryId);
  }

  @Mutation(() => Issue)
  assignIssue(
    @Args('issueId', { type: () => ID }) issueId: string,
    @Args('assigneeId', { type: () => ID }) assigneeId: string,
  ) {
    return this.issuesService.assign(issueId, assigneeId);
  }

  @Mutation(() => Issue)
  unassignIssue(
    @Args('issueId', { type: () => ID }) issueId: string,
    @Args('assigneeId', { type: () => ID }) assigneeId: string,
  ) {
    return this.issuesService.unassign(issueId, assigneeId);
  }

  @Mutation(() => Issue)
  changeIssueState(
    @Args('issueId', { type: () => ID }) issueId: string,
    @Args('state') state: string,
  ) {
    return this.issuesService.changeState(issueId, state);
  }
}
