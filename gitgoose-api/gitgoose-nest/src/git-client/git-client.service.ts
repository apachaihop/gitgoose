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

@Injectable()
export class GitClientService {
  private readonly logger = new Logger(GitClientService.name);
  private socket: Socket;

  constructor() {
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
      throw new Error('Not connected to Git service');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Operation timed out'));
      }, 30000);

      this.socket.emit(event, data, (response: any) => {
        clearTimeout(timeout);
        if (response && typeof response === 'object' && 'error' in response) {
          reject(new Error(String(response.error)));
        } else {
          resolve(response as T);
        }
      });
    });
  }

  async initRepo(repoId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('initRepo', repoId, (response: any) => {
        if (
          typeof response === 'object' &&
          response !== null &&
          'error' in response
        ) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
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

  async getCommitHistory(repoId: string, branch?: string) {
    return await this.emit('getCommitHistory', { repoId, branch });
  }

  async cloneRepo(dto: RemoteOperationDto) {
    return await this.emit('cloneRepo', dto);
  }

  async push(dto: RemoteOperationDto) {
    return await this.emit('push', dto);
  }

  async pull(dto: RemoteOperationDto) {
    return await this.emit('pull', dto);
  }

  async handleBranchOperation(dto: BranchOperationDto) {
    return await this.emit('branchOperation', dto);
  }

  async uploadFiles(
    dto: UploadFilesInput,
    userId: string,
  ): Promise<CommitInfo> {
    const fileChanges: FileChange[] = [];

    // Process each uploaded file
    for (const filePromise of dto.files) {
      const file = await filePromise;
      const content = await this.readFileContent(file);

      fileChanges.push({
        path: file.filename,
        content: content,
        operation: 'add',
      });
    }

    // Create commit with uploaded files
    return await this.createCommit({
      repoId: dto.repositoryId,
      message: dto.commitMessage,
      branch: dto.branch,
      authorId: userId,
      authorName: 'System', // You might want to get actual user name
      authorEmail: 'system@gitgoose.com', // You might want to get actual user email
      files: fileChanges,
    });
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
}
