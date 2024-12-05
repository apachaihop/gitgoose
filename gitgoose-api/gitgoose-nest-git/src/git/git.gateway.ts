import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { GitService } from './git.service';
import { CreateCommitDto } from './dto/create-commit.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { FileOperationDto } from './dto/file-operation.dto';
import { RemoteOperationDto } from './dto/remote-operation.dto';
import { MergeDto } from './dto/merge.dto';
import { FileTreeRequestDto } from './dto/file-tree.dto';
import { UpdateBranchMetadataDto } from './dto/update-branch-metadata.dto';
import { Socket } from 'socket.io';
import { PackFileResult } from './interfaces/git-operation.interface';
import { PackFileRequest } from './interfaces/git-operation.interface';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
})
export class GitGateway {
  constructor(private readonly gitService: GitService) {}

  @SubscribeMessage('initRepo')
  async handleInitRepo(@MessageBody() repoId: string) {
    return await this.gitService.initRepo(repoId);
  }

  @SubscribeMessage('createCommit')
  async handleCommit(@MessageBody() dto: CreateCommitDto) {
    return await this.gitService.createCommit(dto);
  }

  @SubscribeMessage('createBranch')
  async handleCreateBranch(@MessageBody() dto: CreateBranchDto) {
    return await this.gitService.createBranch(dto);
  }

  @SubscribeMessage('getBranches')
  async handleGetBranches(@MessageBody() repoId: string) {
    return await this.gitService.getBranches(repoId);
  }

  @SubscribeMessage('fileOperation')
  async handleFileOperation(@MessageBody() dto: FileOperationDto) {
    return await this.gitService.handleFileOperation(dto);
  }

  @SubscribeMessage('getCommitHistory')
  async handleGetCommitHistory(
    @MessageBody() data: { repoId: string; branch?: string },
  ) {
    return await this.gitService.getCommitHistory(data.repoId, data.branch);
  }

  @SubscribeMessage('cloneRepo')
  async handleCloneRepo(@MessageBody() dto: RemoteOperationDto) {
    return await this.gitService.cloneRepo(dto);
  }

  @SubscribeMessage('push')
  async handlePush(@MessageBody() dto: RemoteOperationDto) {
    return await this.gitService.push(dto);
  }

  @SubscribeMessage('pull')
  async handlePull(@MessageBody() dto: RemoteOperationDto) {
    return await this.gitService.pull(dto);
  }

  @SubscribeMessage('merge')
  async handleMerge(@MessageBody() dto: MergeDto) {
    return await this.gitService.merge(dto);
  }

  @SubscribeMessage('getFileTree')
  async handleGetFileTree(@MessageBody() dto: FileTreeRequestDto) {
    return await this.gitService.getFileTree(dto);
  }

  @SubscribeMessage('getFileContent')
  async handleGetFileContent(@MessageBody() dto: FileTreeRequestDto) {
    return await this.gitService.getFileContent(dto);
  }

  @SubscribeMessage('updateBranchMetadata')
  async handleUpdateBranchMetadata(
    @MessageBody() dto: UpdateBranchMetadataDto,
    @ConnectedSocket() client: Socket,
  ): Promise<{ success: true }> {
    try {
      await this.gitService.updateBranchMetadata(dto);
      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('getBranchMetadata')
  async handleGetBranchMetadata(
    @MessageBody() data: { repoId: string; branch: string },
  ) {
    return await this.gitService.getBranchMetadata(data.repoId, data.branch);
  }

  @SubscribeMessage('getRemoteUrl')
  async handleGetRemoteUrl(
    @MessageBody() data: { repoId: string; remote: string },
  ): Promise<{ url: string }> {
    try {
      return await this.gitService.getRemoteUrl(data.repoId, data.remote);
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('listRemotes')
  async handleListRemotes(
    @MessageBody() data: { repoId: string },
  ): Promise<Array<{ remote: string; url: string }>> {
    try {
      return await this.gitService.listRemotes(data.repoId);
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('addRemote')
  async handleAddRemote(
    @MessageBody() dto: { repoId: string; remote: string; url: string },
  ): Promise<{ success: true }> {
    try {
      return await this.gitService.addRemote(dto);
    } catch (error) {
      throw new WsException(error.message);
    }
  }
  @SubscribeMessage('generatePackFile')
  async handleGeneratePackFile(
    @MessageBody() data: PackFileRequest,
  ): Promise<PackFileResult> {
    try {
      console.log('generatePackFile', data);
      return await this.gitService.generatePackFile(data);
    } catch (error) {
      throw new WsException(error.message);
    }
  }
}
