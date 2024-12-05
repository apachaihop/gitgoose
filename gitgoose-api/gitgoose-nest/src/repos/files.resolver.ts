import {
  Resolver,
  Query,
  Args,
  ObjectType,
  Field,
  Mutation,
} from '@nestjs/graphql';
import { GitClientService } from '../git-client/git-client.service';
import { UploadFilesInput } from '../git-client/dto/upload-files.dto';
import { User } from '../auth/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql_auth/gql_auth.guard';
import { CommitsService } from '../commits/commits.service';

@ObjectType()
class CommitAuthor {
  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;
}

@ObjectType()
class CommitResult {
  @Field()
  sha: string;

  @Field()
  message: string;

  @Field(() => CommitAuthor)
  author: CommitAuthor;

  @Field()
  timestamp: number;
}

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

  @Field(() => [FileTreeItem], { nullable: true })
  children?: FileTreeItem[];
}

@Resolver('Files')
export class FilesResolver {
  constructor(
    private readonly gitClientService: GitClientService,
    private readonly commitsService: CommitsService,
  ) {}

  @Query(() => [FileTreeItem])
  async getRepositoryFiles(
    @Args('repositoryId') repositoryId: string,
    @Args('ref', { nullable: true }) ref?: string,
    @Args('path', { nullable: true }) path?: string,
  ): Promise<FileTreeItem[]> {
    const fileTree = await this.gitClientService.getFileTree({
      repoId: repositoryId,
      ref,
      path,
    });

    return fileTree;
  }

  @Query(() => FileTreeItem)
  async getFileDetails(
    @Args('repositoryId') repositoryId: string,
    @Args('path') path: string,
    @Args('ref', { nullable: true }) ref?: string,
  ): Promise<FileTreeItem> {
    const content = await this.gitClientService.getFileContent({
      repoId: repositoryId,
      ref,
      path,
    });

    return {
      path,
      type: 'file',
      content,
      size: content.length,
    };
  }

  @Mutation(() => CommitResult)
  @UseGuards(GqlAuthGuard)
  async uploadFiles(
    @Args('input') input: UploadFilesInput,
    @CurrentUser() user: User,
  ): Promise<CommitResult> {
    const commit = await this.commitsService.create({
      message: input.commitMessage,
      authorName: user.name || user.username,
      authorEmail: user.email,
      authorId: user.id,
      repositoryId: input.repositoryId,
      branch: input.branch,
      files: input.files,
    });

    return {
      sha: commit.sha,
      message: commit.message,
      author: {
        name: commit.authorName,
        email: commit.authorEmail,
      },
      timestamp: commit.createdAt.getTime(),
    };
  }
}
