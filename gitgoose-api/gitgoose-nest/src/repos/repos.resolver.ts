import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { ReposService } from './repos.service';
import { Repo } from './entities/repo.entity';
import { CreateRepoInput } from './dto/create-repo.input';
import { UpdateRepoInput } from './dto/update-repo.input';
import { CloneRepositoryInput } from './dto/clone-repository.input';
import { GqlAuthGuard } from '../auth/gql_auth/gql_auth.guard';
import { UseGuards } from '@nestjs/common';
import { Commit } from '../commits/entities/commit.entity';
import { UploadFilesInput } from '../git-client/dto/upload-files.dto';

@Resolver(() => Repo)
export class ReposResolver {
  constructor(private readonly reposService: ReposService) {}

  @Mutation(() => Repo)
  createRepo(@Args('createRepoInput') createRepoInput: CreateRepoInput) {
    return this.reposService.create(createRepoInput);
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
    @Context() context: any,
  ) {
    return this.reposService.cloneRepository({
      ...input,
      ownerId: context.req.user.id,
    });
  }

  @Query(() => String)
  async getCloneUrl(@Args('id', { type: () => ID }) id: string) {
    return this.reposService.getCloneUrl(id);
  }

  @Mutation(() => Commit)
  @UseGuards(GqlAuthGuard)
  async uploadFiles(
    @Args('input') input: UploadFilesInput,
    @Context() context: any,
  ) {
    return this.reposService.uploadFiles(input, context.req.user.id);
  }
}
