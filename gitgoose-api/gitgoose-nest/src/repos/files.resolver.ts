import { Resolver, Query, Args, ObjectType, Field } from '@nestjs/graphql';
import { GitClientService } from '../git-client/git-client.service';

@ObjectType()
export class FileTreeItem {
  @Field()
  path: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  size?: number;
}

@Resolver('Files')
export class FilesResolver {
  constructor(private readonly gitClientService: GitClientService) {}

  @Query(() => [FileTreeItem])
  async getRepositoryFiles(
    @Args('repositoryId') repositoryId: string,
    @Args('ref', { nullable: true }) ref?: string,
    @Args('path', { nullable: true }) path?: string,
  ): Promise<FileTreeItem[]> {
    return await this.gitClientService.getFileTree({
      repoId: repositoryId,
      ref,
      path,
    });
  }

  @Query(() => String)
  async getFileContent(
    @Args('repositoryId') repositoryId: string,
    @Args('path') path: string,
    @Args('ref', { nullable: true }) ref?: string,
  ): Promise<string> {
    return await this.gitClientService.getFileContent({
      repoId: repositoryId,
      ref,
      path,
    });
  }
}
