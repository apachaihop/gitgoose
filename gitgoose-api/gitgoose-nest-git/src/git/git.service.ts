import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import * as git from 'isomorphic-git';
import * as fs from 'fs';
import http from 'isomorphic-git/http/node';
import { CommitInfo, BranchInfo } from './interfaces/git-operation.interface';
import { CreateCommitDto } from './dto/create-commit.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { FileOperationDto } from './dto/file-operation.dto';
import { RemoteOperationDto } from './dto/remote-operation.dto';
import { MergeDto } from './dto/merge.dto';
import { FileTreeItem, FileTreeRequestDto } from './dto/file-tree.dto';

@Injectable()
export class GitService {
  constructor(private readonly storageService: StorageService) {}

  async initRepo(repoId: string): Promise<string> {
    const dir = await this.storageService.ensureRepoDirectory(repoId);
    await git.init({ fs, dir });
    return dir;
  }

  async createCommit(dto: CreateCommitDto): Promise<CommitInfo> {
    const dir = await this.storageService.getRepoPath(dto.repoId);

    try {
      // Check if any branch exists, if not create 'main'
      const branches = await git.listBranches({ fs, dir });
      const targetBranch = dto.branch || 'main';

      if (branches.length === 0) {
        // For first commit, we need to initialize the branch differently
        // Add and commit files first
        await Promise.all(
          dto.files.map(async (file) => {
            await this.storageService.writeFile(
              dto.repoId,
              file.path,
              file.content,
            );
            await git.add({ fs, dir, filepath: file.path });
          }),
        );

        const author = {
          name: dto.authorName,
          email: dto.authorEmail || `${dto.authorId}@gitgoose.com`,
        };

        // Create initial commit
        const sha = await git.commit({
          fs,
          dir,
          message: dto.message,
          author,
          ref: targetBranch,
        });

        return {
          sha,
          message: dto.message,
          author,
          timestamp: Date.now(),
        };
      }

      // For subsequent commits
      if (!branches.includes(targetBranch)) {
        await git.branch({
          fs,
          dir,
          ref: targetBranch,
        });
      }

      await git.checkout({
        fs,
        dir,
        ref: targetBranch,
        force: true,
      });

      // Add and commit files
      await Promise.all(
        dto.files.map(async (file) => {
          await this.storageService.writeFile(
            dto.repoId,
            file.path,
            file.content,
          );
          await git.add({ fs, dir, filepath: file.path });
        }),
      );

      const author = {
        name: dto.authorName,
        email: dto.authorEmail || `${dto.authorId}@gitgoose.com`,
      };

      const sha = await git.commit({
        fs,
        dir,
        message: dto.message,
        author,
      });

      return {
        sha,
        message: dto.message,
        author,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(`Failed to create commit: ${error.message}`);
    }
  }

  async createBranch(dto: CreateBranchDto): Promise<BranchInfo> {
    const dir = await this.storageService.getRepoPath(dto.repoId);

    try {
      const object = dto.startPoint
        ? await git.resolveRef({ fs, dir, ref: dto.startPoint })
        : undefined;

      await git.branch({
        fs,
        dir,
        ref: dto.name,
        checkout: true,
        object,
      });

      const sha = await git.resolveRef({ fs, dir, ref: dto.name });
      return { name: dto.name, sha, isHead: true };
    } catch (error) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  async getBranches(repoId: string): Promise<BranchInfo[]> {
    const dir = await this.storageService.getRepoPath(repoId);

    try {
      const [branches, currentBranch] = await Promise.all([
        git.listBranches({ fs, dir }),
        git.currentBranch({ fs, dir }),
      ]);

      return await Promise.all(
        branches.map(async (name) => ({
          name,
          sha: await git.resolveRef({ fs, dir, ref: name }),
          isHead: name === currentBranch,
        })),
      );
    } catch (error) {
      throw new Error(`Failed to get branches: ${error.message}`);
    }
  }

  async handleFileOperation(dto: FileOperationDto): Promise<{
    content?: string;
    files?: Array<{ path: string; type: 'file' | 'tree' }>;
  }> {
    const dir = await this.storageService.getRepoPath(dto.repoId);

    try {
      if (dto.branch) {
        await this.checkout(dto.repoId, dto.branch);
      }

      switch (dto.operation) {
        case 'read':
          const content = await this.storageService.readFile(
            dto.repoId,
            dto.path,
          );
          return { content };

        case 'write':
          if (!dto.content)
            throw new Error('Content is required for write operation');
          await this.storageService.writeFile(
            dto.repoId,
            dto.path,
            dto.content,
          );
          return {};

        case 'delete':
          await this.storageService.deleteFile(dto.repoId, dto.path);
          return {};

        case 'list':
          const entries = await git.listFiles({
            fs,
            dir,
            ref: dto.branch || 'HEAD',
          });
          return {
            files: entries.map((entry) => ({
              path: entry,
              type: entry.endsWith('/') ? 'tree' : 'file',
            })),
          };

        default:
          throw new Error(`Unsupported operation: ${dto.operation}`);
      }
    } catch (error) {
      throw new Error(`File operation failed: ${error.message}`);
    }
  }

  async getCommitHistory(
    repoId: string,
    branch?: string,
  ): Promise<CommitInfo[]> {
    const dir = await this.storageService.getRepoPath(repoId);

    try {
      const commits = await git.log({
        fs,
        dir,
        ref: branch || 'HEAD',
        depth: 50,
      });

      return commits.map((commit) => ({
        sha: commit.oid,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
        },
        timestamp: commit.commit.author.timestamp * 1000,
      }));
    } catch (error) {
      throw new Error(`Failed to get commit history: ${error.message}`);
    }
  }

  private async checkout(repoId: string, branchName: string): Promise<void> {
    const dir = await this.storageService.getRepoPath(repoId);
    await git.checkout({
      fs,
      dir,
      ref: branchName,
      force: true,
    });
  }

  async cloneRepo(dto: RemoteOperationDto): Promise<string> {
    const dir = await this.storageService.ensureRepoDirectory(dto.repoId);

    try {
      await git.clone({
        fs,
        http,
        dir,
        url: dto.url,
        ref: dto.branch || 'main',
        singleBranch: true,
        depth: 1,
        ...(dto.auth && {
          onAuth: () => ({
            username: dto.auth.username,
            password: dto.auth.password,
          }),
        }),
      });

      return dir;
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }

  async push(dto: RemoteOperationDto): Promise<void> {
    const dir = await this.storageService.getRepoPath(dto.repoId);

    try {
      await git.push({
        fs,
        http,
        dir,
        remote: dto.remote || 'origin',
        ref: dto.branch || 'main',
        ...(dto.auth && {
          onAuth: () => ({
            username: dto.auth.username,
            password: dto.auth.password,
          }),
        }),
      });
    } catch (error) {
      throw new Error(`Failed to push: ${error.message}`);
    }
  }

  async pull(dto: RemoteOperationDto): Promise<void> {
    const dir = await this.storageService.getRepoPath(dto.repoId);

    try {
      await git.pull({
        fs,
        http,
        dir,
        remote: dto.remote || 'origin',
        ref: dto.branch || 'main',
        ...(dto.auth && {
          onAuth: () => ({
            username: dto.auth.username,
            password: dto.auth.password,
          }),
        }),
      });
    } catch (error) {
      throw new Error(`Failed to pull: ${error.message}`);
    }
  }

  async merge(dto: MergeDto): Promise<CommitInfo> {
    const dir = await this.storageService.getRepoPath(dto.repoId);

    try {
      // Checkout target branch first
      await git.checkout({
        fs,
        dir,
        ref: dto.targetBranch,
        force: true,
      });

      // Perform the merge
      const { oid } = await git.merge({
        fs,
        dir,
        theirs: dto.sourceBranch,
        author: dto.author,
        message: dto.message,
      });

      return {
        sha: oid,
        message: dto.message,
        author: dto.author,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(`Failed to merge branches: ${error.message}`);
    }
  }

  async getFileTree(dto: FileTreeRequestDto): Promise<FileTreeItem[]> {
    const dir = await this.storageService.getRepoPath(dto.repoId);

    try {
      if (dto.branch) {
        await this.checkout(dto.repoId, dto.branch);
      }

      const files = await git.listFiles({
        fs,
        dir,
        ref: dto.branch || 'HEAD',
      });

      // Convert flat file list to tree structure
      const fileTree: FileTreeItem[] = [];
      for (const filePath of files) {
        const parts = filePath.split('/');
        let currentLevel = fileTree;

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const isFile = i === parts.length - 1;
          const existingItem = currentLevel.find(item => item.name === part);

          if (existingItem) {
            if (!isFile) {
              currentLevel = existingItem.children!;
            }
          } else {
            const newItem: FileTreeItem = {
              name: part,
              path: parts.slice(0, i + 1).join('/'),
              type: isFile ? 'file' : 'directory',
            };

            if (!isFile) {
              newItem.children = [];
            }

            currentLevel.push(newItem);
            if (!isFile) {
              currentLevel = newItem.children!;
            }
          }
        }
      }

      return fileTree;
    } catch (error) {
      throw new Error(`Failed to get file tree: ${error.message}`);
    }
  }

  async getFileContent(dto: FileTreeRequestDto): Promise<string> {
    const dir = await this.storageService.getRepoPath(dto.repoId);

    try {
      if (dto.branch) {
        await this.checkout(dto.repoId, dto.branch);
      }
      const content = await this.storageService.readFile(dto.repoId, dto.path);
      return content;
    } catch (error) {
      throw new Error(`Failed to get file content: ${error.message}`);
    }
  }
}
