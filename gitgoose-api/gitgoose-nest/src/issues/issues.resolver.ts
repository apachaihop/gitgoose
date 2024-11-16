import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { IssuesService } from './issues.service';
import { Issue } from './entities/issue.entity';
import { CreateIssueInput } from './dto/create-issue.input';
import { UpdateIssueInput } from './dto/update-issue.input';

@Resolver(() => Issue)
export class IssuesResolver {
  constructor(private readonly issuesService: IssuesService) {}

  @Mutation(() => Issue)
  createIssue(@Args('createIssueInput') createIssueInput: CreateIssueInput) {
    return this.issuesService.create(createIssueInput);
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
}
