import { Injectable, Logger } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { CreateCommitDto, FileChange } from './dto/create-commit.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { FileOperationDto } from './dto/file-operation.dto';
import { RemoteOperationDto } from './dto/remote-operation.dto';
import { BranchOperationDto } from './dto/branch-operation.dto';
import { CommitInfo } from './interfaces/git-operation.interface';
import { UploadFilesInput, FileUpload } from './dto/upload-files.dto';
import { FileTreeItem, FileTreeRequestDto } from './dto/file-tree.dto';
import { FileOperation } from './dto/file-operation.enum';
import { AuthService } from '../auth/auth.service';
import { CommitSyncService } from './commit-sync.service';

@Injectable()
export class GitClientService {
  private readonly logger = new Logger(GitClientService.name);
  private socket: Socket;

  constructor(
    private readonly authService: AuthService,
    private readonly commitSyncService: CommitSyncService,
  ) {
    const gitServiceUrl =
      process.env.GIT_SERVICE_URL || 'http://localhost:3001';
    this.socket = io(gitServiceUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this.logger.log('Connected to Git Service');
    });

    this.socket.on('connect_error', (error) => {
      this.logger.error(`Connection error: ${error.message}`);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('disconnect', () => {
      this.logger.warn('Disconnected from Git Service');
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.logger.log(
        `Reconnected to Git Service after ${attemptNumber} attempts`,
      );
    });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private async emit<T>(event: string, data: any): Promise<T> {
    if (!this.isConnected()) {
      this.logger.error(
        `Socket not connected when attempting to emit ${event}`,
      );
      throw new Error('Not connected to Git service');
    }

    return new Promise((resolve, reject) => {
      this.logger.debug(`Emitting ${event} with data:`, data);

      const timeout = setTimeout(() => {
        this.logger.error(`Operation ${event} timed out after 30 seconds`);
        reject(new Error(`Operation ${event} timed out`));
      }, 30000);

      this.socket.emit(event, data, (response: any) => {
        clearTimeout(timeout);
        this.logger.debug(`Received response for ${event}:`, response);

        if (response && typeof response === 'object' && 'error' in response) {
          this.logger.error(`Error in ${event} response:`, response.error);
          reject(new Error(String(response.error)));
        } else {
          resolve(response as T);
        }
      });
    });
  }

  async initRepo(repoId: string, remoteUrl?: string): Promise<void> {
    try {
      // First initialize the repository
      await this.emit('initRepo', repoId);

      // If a remote URL is provided, add it as the origin remote
      if (remoteUrl) {
        console.log('adding remote', remoteUrl);
        const result = await this.emit<{ success: true }>('addRemote', {
          repoId,
          remote: 'origin',
          url: remoteUrl,
        });
        if (!result?.success) {
          throw new Error('Failed to add remote: No success response received');
        }
        console.log('remote added');
      }
    } catch (error) {
      this.logger.error(`Failed to initialize repository: ${error.message}`);
      throw new Error(`Failed to initialize repository: ${error.message}`);
    }
  }

  async createCommit(commitData: CreateCommitDto): Promise<CommitInfo> {
    return await this.emit<CommitInfo>('createCommit', commitData);
  }

  async createBranch(dto: CreateBranchDto) {
    return await this.emit('createBranch', dto);
  }

  async getBranches(repoId: string) {
    return await this.emit('getBranches', repoId);
  }

  async handleFileOperation(dto: FileOperationDto) {
    return await this.emit('fileOperation', dto);
  }

  async getCommitHistory(
    repoId: string,
    branch?: string,
  ): Promise<CommitInfo[]> {
    return await this.emit('getCommitHistory', { repoId, branch });
  }

  async cloneRepo(dto: RemoteOperationDto) {
    return await this.emit('cloneRepo', dto);
  }

  async push(dto: RemoteOperationDto) {
    const result = await this.emit('push', dto);

    // After successful push, store new commits
    const commits = await this.getCommitHistory(dto.repoId);
    await this.commitSyncService.syncCommits(dto.repoId, commits);

    return result;
  }

  async pull(dto: RemoteOperationDto): Promise<any> {
    try {
      // First, update branch and commit metadata in database
      await this.updateRepoMetadata(dto.repoId);

      // Ensure we have either a remote name or URL
      if (!dto.remote && !dto.url) {
        // You might want to get this URL from your repository configuration
        dto.remote = 'origin'; // Use default remote name if none specified
      }

      // Then perform the pull operation
      return await this.emit('pull', dto);
    } catch (error) {
      this.logger.error(`Pull failed: ${error.message}`);
      throw error;
    }
  }

  private async updateRepoMetadata(repoId: string): Promise<void> {
    try {
      // Get latest branches from Git
      const gitBranches = await this.emit<any[]>('getBranches', repoId);
      console.log('gitBranches', gitBranches);

      // Get latest commit history for each branch
      for (const branch of gitBranches) {
        const commits = await this.emit<CommitInfo[]>('getCommitHistory', {
          repoId,
          branch: branch.name,
        });
        console.log('commits', commits);

        if (commits && commits.length > 0) {
          // Update the return type expectation
          const result = await this.emit<{ success: true }>(
            'updateBranchMetadata',
            {
              repoId,
              branch: branch.name,
              lastCommit: commits[0],
            },
          );

          if (!result?.success) {
            throw new Error(
              'Failed to update branch metadata: No success response received',
            );
          }

          console.log(`Branch ${branch.name} metadata updated successfully`);
        } else {
          console.warn(`No commits found for branch ${branch.name}`);
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to update repo metadata: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to update repository metadata before pull');
    }
  }

  async handleBranchOperation(dto: BranchOperationDto) {
    return await this.emit('branchOperation', dto);
  }

  async uploadFiles(
    dto: UploadFilesInput,
    userId: string,
  ): Promise<CommitInfo> {
    // First, handle each file operation
    for (const file of dto.files) {
      const operation =
        file.operation === 'add' || file.operation === 'modify'
          ? FileOperation.WRITE
          : FileOperation.DELETE;

      await this.handleFileOperation({
        repoId: dto.repositoryId,
        operation,
        path: file.path,
        content: file.content,
        branch: dto.branch,
      });
    }

    // Then create the commit with the changes
    const fileChanges: FileChange[] = dto.files.map((file) => ({
      path: file.path,
      content: file.content,
      operation: file.operation,
    }));

    return await this.createCommit({
      repoId: dto.repositoryId,
      message: dto.commitMessage,
      branch: dto.branch,
      authorId: userId,
      authorName: 'System',
      authorEmail: 'system@gitgoose.com',
      files: fileChanges,
    });
  }

  private isFileUpload(file: any): file is Promise<FileUpload> {
    return file instanceof Promise;
  }

  private async readFileContent(file: FileUpload): Promise<string> {
    return new Promise((resolve, reject) => {
      let content = '';
      file
        .createReadStream()
        .on('data', (chunk) => (content += chunk))
        .on('end', () => resolve(content))
        .on('error', reject);
    });
  }

  async getFileTree(dto: FileTreeRequestDto): Promise<FileTreeItem[]> {
    return await this.emit<FileTreeItem[]>('getFileTree', dto);
  }

  async getFileContent(dto: FileTreeRequestDto): Promise<string> {
    return await this.emit<string>('getFileContent', dto);
  }

  async merge(dto: {
    repoId: string;
    sourceBranch: string;
    targetBranch: string;
    message: string;
    author: { name: string; email: string };
  }) {
    return await this.emit('merge', dto);
  }

  async getRemoteUrl(dto: { repoId: string; remote: string }): Promise<string> {
    try {
      const result = await this.emit<{ url: string }>('getRemoteUrl', dto);
      if (!result?.url) {
        throw new Error('Remote URL not found');
      }
      return result.url;
    } catch (error) {
      this.logger.error(`Failed to get remote URL: ${error.message}`);
      throw new Error(`Failed to get remote URL: ${error.message}`);
    }
  }

  async listRemotes(dto: {
    repoId: string;
  }): Promise<Array<{ remote: string; url: string }>> {
    try {
      return await this.emit<Array<{ remote: string; url: string }>>(
        'listRemotes',
        dto,
      );
    } catch (error) {
      this.logger.error(`Failed to list remotes: ${error.message}`);
      throw new Error(`Failed to list remotes: ${error.message}`);
    }
  }

  async generatePackFile(repoId: string, wants?: string[]): Promise<Buffer> {
    try {
      this.logger.debug(
        `Attempting to generate packfile for repo ${repoId} with wants: ${JSON.stringify(wants)}`,
      );

      // Add connection check with detailed logging
      if (!this.isConnected()) {
        this.logger.error(
          'Socket not connected when attempting to generate packfile',
        );
        throw new Error('Git service connection not available');
      }

      const result = await this.emit<{ packfile: Buffer }>('generatePackFile', {
        repoId,
        wants,
      });

      this.logger.debug(
        `Received packfile response: ${result ? 'success' : 'null'}`,
      );
      if (result?.packfile) {
        this.logger.debug(`Packfile size: ${result.packfile.length} bytes`);
      }

      if (!result?.packfile) {
        this.logger.error('No packfile received in response');
        throw new Error('Failed to generate packfile: Empty response');
      }

      return result.packfile;
    } catch (error) {
      this.logger.error(
        `Failed to generate packfile: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
