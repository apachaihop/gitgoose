import { GqlAuthGuard } from './../auth/gql_auth/gql_auth.guard';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BranchesService } from './branches.service';
import { Branch } from './entities/branch.entity';
import { CreateBranchInput } from './dto/create-branch.input';
import { UpdateBranchInput } from './dto/update-branch.input';
import { UseGuards } from '@nestjs/common';

@UseGuards(GqlAuthGuard)
@Resolver(() => Branch)
export class BranchesResolver {
  constructor(private readonly branchesService: BranchesService) {}

  @Mutation(() => Branch)
  createBranch(
    @Args('createBranchInput') createBranchInput: CreateBranchInput,
  ) {
    return this.branchesService.create(createBranchInput);
  }

  @Query(() => [Branch], { name: 'branches' })
  findAll() {
    return this.branchesService.findAll();
  }

  @Query(() => Branch, { name: 'branch' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.branchesService.findOne(id);
  }

  @Query(() => [Branch], { name: 'branchesByRepository' })
  findByRepository(
    @Args('repositoryId', { type: () => ID }) repositoryId: string,
  ) {
    return this.branchesService.findByRepository(repositoryId);
  }

  @Mutation(() => Branch)
  updateBranch(
    @Args('updateBranchInput') updateBranchInput: UpdateBranchInput,
  ) {
    return this.branchesService.update(updateBranchInput.id, updateBranchInput);
  }

  @Mutation(() => Branch)
  removeBranch(@Args('id', { type: () => ID }) id: string) {
    return this.branchesService.remove(id);
  }

  @Mutation(() => Branch)
  setProtected(
    @Args('id', { type: () => ID }) id: string,
    @Args('isProtected', { type: () => Boolean }) isProtected: boolean,
  ) {
    return this.branchesService.setProtected(id, isProtected);
  }

  @Mutation(() => Branch)
  updateLastCommit(
    @Args('id', { type: () => ID }) id: string,
    @Args('sha') sha: string,
    @Args('message') message: string,
    @Args('authorId', { type: () => ID }) authorId: string,
  ) {
    return this.branchesService.updateLastCommit(id, sha, message, authorId);
  }
}
