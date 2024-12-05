import { Injectable, Logger } from '@nestjs/common';
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
import { UpdateBranchMetadataDto } from './dto/update-branch-metadata.dto';
import {
  PackFileResult,
  PackFileRequest,
} from './interfaces/git-operation.interface';

interface GitObject {
  type: 'blob' | 'tree' | 'commit' | 'tag';
  object: CommitObject | TreeObject | Uint8Array;
}

interface CommitObject {
  tree: string;
  parent: string | string[];
  author: {
    name: string;
    email: string;
    timestamp: number;
  };
  message: string;
}

interface TreeEntry {
  mode: string;
  path: string;
  oid: string;
  type: 'blob' | 'tree';
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TreeObject extends Array<TreeEntry> {}

@Injectable()
export class GitService {
  private readonly logger = new Logger(GitService.name);
  constructor(private readonly storageService: StorageService) {}

  async initRepo(repoId: string): Promise<string> {
    const dir = await this.storageService.ensureRepoDirectory(repoId);

    try {
      // Initialize git repository
      await git.init({ fs, dir, defaultBranch: 'main' });

      // Create empty tree for initial state
      const emptyTree = await git.writeTree({
        fs,
        dir,
        tree: [],
      });

      // Create initial commit
      const initialCommit = await git.commit({
        fs,
        dir,
        message: 'Initial commit',
        tree: emptyTree,
        parent: [],
        author: {
          name: 'System',
          email: 'system@gitgoose.com',
          timestamp: Math.floor(Date.now() / 1000),
          timezoneOffset: 0,
        },
      });

      // Set up main branch to point to the initial commit
      await git.writeRef({
        fs,
        dir,
        ref: 'refs/heads/main',
        value: initialCommit,
        force: true,
      });

      this.logger.debug(`Repository initialized at: ${dir}`);
      const branches = await git.listBranches({ fs, dir });
      const head = await git.resolveRef({ fs, dir, ref: 'HEAD' });
      const mainRef = await git.resolveRef({ fs, dir, ref: 'refs/heads/main' });

      this.logger.debug(`Repository initialized with:
        Branches: ${branches.join(', ')}
        HEAD: ${head}
        main ref: ${mainRef}
      `);
      return dir;
    } catch (error) {
      this.logger.error(`Failed to initialize repository: ${error.message}`);
      throw new Error(`Failed to initialize repository: ${error.message}`);
    }
  }

  async createCommit(dto: CreateCommitDto): Promise<CommitInfo> {
    const dir = await this.storageService.getRepoPath(dto.repoId);
    try {
      const files = dto.files || [];
      const targetBranch = dto.branch || 'main';

      // Handle each file operation
      for (const file of files) {
        switch (file.operation) {
          case 'add':
          case 'modify':
            await this.storageService.writeFile(
              dto.repoId,
              file.path,
              file.content || '',
            );
            await git.add({
              fs,
              dir,
              filepath: file.path,
            });
            break;

          case 'delete':
            try {
              await this.storageService.deleteFile(dto.repoId, file.path);
              await git.remove({
                fs,
                dir,
                filepath: file.path,
              });
            } catch (error) {
              if (!error.message.includes('ENOENT')) {
                throw error;
              }
            }
            break;
        }
      }

      const author = {
        name: dto.authorName,
        email: dto.authorEmail || `${dto.authorId}@gitgoose.com`,
      };

      // Get current branch ref to determine parent
      let parentShas: string[] = [];
      try {
        const currentRef = await git.resolveRef({
          fs,
          dir,
          ref: targetBranch,
        });
        if (currentRef) {
          parentShas = [currentRef];
        }
      } catch (error) {
        // If ref doesn't exist, this will be the first commit
        parentShas = [];
      }

      // Create the commit
      const sha = await git.commit({
        fs,
        dir,
        message: dto.message,
        author,
        parent: parentShas,
      });

      return {
        sha,
        message: dto.message,
        author,
        parentShas,
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
        parentShas: Array.isArray(commit.commit.parent)
          ? commit.commit.parent
          : commit.commit.parent
            ? [commit.commit.parent]
            : [],
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
      // If no remote or URL is provided, try to get the default remote URL
      if (!dto.remote && !dto.url) {
        try {
          const remotes = await git.listRemotes({ fs, dir });
          const originRemote = remotes.find(
            (remote) => remote.remote === 'origin',
          );
          if (!originRemote) {
            throw new Error(
              'No remote URL configured and no origin remote found',
            );
          }
          dto.url = originRemote.url;
        } catch (error) {
          throw new Error(`Failed to get remote URL: ${error.message}`);
        }
      }

      await git.pull({
        fs,
        http,
        dir,
        remote: dto.remote || 'origin',
        url: dto.url,
        ref: dto.branch || 'main',
        author: {
          name: 'System',
          email: 'system@gitgoose.com',
        },
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

      // Get the SHAs of both branches to use as parents
      const [targetSha, sourceSha] = await Promise.all([
        git.resolveRef({ fs, dir, ref: dto.targetBranch }),
        git.resolveRef({ fs, dir, ref: dto.sourceBranch }),
      ]);

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
        parentShas: [targetSha, sourceSha],
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(`Failed to merge branches: ${error.message}`);
    }
  }

  async getFileTree(dto: FileTreeRequestDto): Promise<FileTreeItem[]> {
    const dir = await this.storageService.getRepoPath(dto.repoId);

    try {
      if (dto.ref) {
        console.log('checkout', dto.ref);
        await this.checkout(dto.repoId, dto.ref);
      }

      const files = await git.listFiles({
        fs,
        dir,
        ref: dto.ref || 'HEAD',
      });
      console.log(files);
      // Filter files based on the requested path
      const relevantFiles = dto.path
        ? files.filter((file) => file.startsWith(dto.path))
        : files;

      // Convert flat file list to tree structure
      const fileTree: FileTreeItem[] = [];
      for (const filePath of relevantFiles) {
        const relativePath = dto.path
          ? filePath.slice(dto.path.length).replace(/^\//, '')
          : filePath;

        const parts = relativePath.split('/');

        // Skip if we're only interested in direct children and this is a nested path
        if (dto.path && parts.length > 1) continue;

        const item: FileTreeItem = {
          name: parts[0],
          path: filePath,
          type: parts.length > 1 ? 'directory' : 'file',
        };

        fileTree.push(item);
      }
      console.log(fileTree);
      return fileTree.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      throw new Error(`Failed to get file tree: ${error.message}`);
    }
  }

  async getFileContent(dto: FileTreeRequestDto): Promise<string> {
    const dir = await this.storageService.getRepoPath(dto.repoId);

    try {
      if (dto.ref) {
        await git.checkout({
          fs,
          dir,
          ref: dto.ref,
          force: true,
        });
      }
      const content = await this.storageService.readFile(dto.repoId, dto.path);
      return content;
    } catch (error) {
      throw new Error(`Failed to get file content: ${error.message}`);
    }
  }

  async updateBranchMetadata(dto: UpdateBranchMetadataDto): Promise<void> {
    const dir = await this.storageService.getRepoPath(dto.repoId);
    console.log('dir', dir);
    try {
      // Verify branch exists
      const branches = await git.listBranches({ fs, dir });
      if (!branches.includes(dto.branch)) {
        throw new Error(`Branch ${dto.branch} not found`);
      }
      console.log('branches', branches);
      // Get current branch ref
      const currentRef = await git.resolveRef({
        fs,
        dir,
        ref: dto.branch,
      });
      console.log('currentRef', currentRef);
      // Verify the last commit matches
      if (currentRef !== dto.lastCommit.sha) {
        console.warn(
          `Branch head mismatch - expected ${dto.lastCommit.sha}, got ${currentRef}`,
        );
        // Instead of throwing error, we'll update with the current state
      }

      const metadata = {
        lastUpdated: new Date().toISOString(),
        lastCommit: {
          ...dto.lastCommit,
          // Ensure timestamp is a number
          timestamp:
            typeof dto.lastCommit.timestamp === 'string'
              ? parseInt(dto.lastCommit.timestamp)
              : dto.lastCommit.timestamp,
        },
      };
      console.log('metadata', metadata);
      // Ensure the metadata directory exists
      await this.storageService.writeFile(
        dto.repoId,
        '.git/metadata/.gitkeep',
        '',
      );
      console.log('metadata directory created');
      // Store metadata in a JSON file
      try {
        await this.storageService.writeFile(
          dto.repoId,
          `.git/metadata/${dto.branch}.json`,
          JSON.stringify(metadata, null, 2),
        );
        console.log('metadata file written');
      } catch (writeError) {
        console.error('Failed to write metadata file:', writeError);
        throw new Error(`Failed to write metadata: ${writeError.message}`);
      }
    } catch (error) {
      console.error('Update branch metadata error:', error);
      throw new Error(`Failed to update branch metadata: ${error.message}`);
    }
  }

  async getBranchMetadata(repoId: string, branch: string) {
    try {
      const metadataPath = `.git/metadata/${branch}.json`;
      const content = await this.storageService.readFile(repoId, metadataPath);
      return JSON.parse(content);
    } catch (error) {
      // Return null if metadata doesn't exist
      return null;
    }
  }

  async getRemoteUrl(
    repoId: string,
    remoteName: string = 'origin',
  ): Promise<{ url: string }> {
    const dir = await this.storageService.getRepoPath(repoId);

    try {
      const remotes = await git.listRemotes({ fs, dir });
      const remote = remotes.find((r) => r.remote === remoteName);
      console.log('remote', remote);
      if (!remote) {
        throw new Error(`Remote '${remoteName}' not found`);
      }

      return { url: remote.url };
    } catch (error) {
      throw new Error(`Failed to get remote URL: ${error.message}`);
    }
  }

  async listRemotes(
    repoId: string,
  ): Promise<Array<{ remote: string; url: string }>> {
    const dir = await this.storageService.getRepoPath(repoId);

    try {
      const remotes = await git.listRemotes({ fs, dir });
      return remotes.map((r) => ({
        remote: r.remote,
        url: r.url,
      }));
    } catch (error) {
      throw new Error(`Failed to list remotes: ${error.message}`);
    }
  }

  async addRemote(dto: {
    repoId: string;
    remote: string;
    url: string;
  }): Promise<{ success: true }> {
    const dir = await this.storageService.getRepoPath(dto.repoId);

    try {
      await git.addRemote({
        fs,
        dir,
        remote: dto.remote,
        url: dto.url,
      });
      console.log('remote added', dto);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to add remote: ${error.message}`);
    }
  }

  async generatePackFile(dto: PackFileRequest): Promise<PackFileResult> {
    const dir = await this.storageService.getRepoPath(dto.repoId);
    this.logger.debug('Starting packfile generation for repo:', dto.repoId);

    try {
      const oids = new Set<string>();
      const seen = new Set<string>();
      const queue = [...(dto.wants || [])];

      this.logger.debug('Initial wants:', queue);

      // Add refs from branches
      const branches = await git.listBranches({ fs, dir });
      for (const branch of branches) {
        try {
          const oid = await git.resolveRef({
            fs,
            dir,
            ref: `refs/heads/${branch}`,
          });
          if (oid) {
            queue.push(oid);
            this.logger.debug(`Added branch ref ${branch} with oid ${oid}`);
          }
        } catch (error) {
          this.logger.warn(
            `Failed to resolve branch ${branch}: ${error.message}`,
          );
        }
      }

      // Add HEAD ref
      try {
        const headOid = await git.resolveRef({ fs, dir, ref: 'HEAD' });
        if (headOid) {
          queue.push(headOid);
          this.logger.debug(`Added HEAD ref with oid ${headOid}`);
        }
      } catch (error) {
        this.logger.warn(`Failed to resolve HEAD: ${error.message}`);
      }

      while (queue.length > 0) {
        const oid = queue.shift()!;
        if (seen.has(oid)) continue;
        seen.add(oid);
        oids.add(oid);

        try {
          const obj = (await git.readObject({
            fs,
            dir,
            oid,
            format: 'parsed',
          })) as GitObject;

          this.logger.debug(`Processing object ${oid} of type ${obj.type}`);

          switch (obj.type) {
            case 'commit': {
              const commit = obj.object as CommitObject;
              // Add tree
              if (commit.tree) {
                queue.push(commit.tree);
                oids.add(commit.tree); // Add tree directly to oids
                this.logger.debug(
                  `Added tree ${commit.tree} from commit ${oid}`,
                );
              }

              // Add parent commits
              if (commit.parent) {
                const parents = Array.isArray(commit.parent)
                  ? commit.parent
                  : [commit.parent];
                for (const parent of parents) {
                  queue.push(parent);
                  oids.add(parent); // Add parent commits directly to oids
                  this.logger.debug(
                    `Added parent commit ${parent} from commit ${oid}`,
                  );
                }
              }
              break;
            }

            case 'tree': {
              const tree = obj.object as TreeObject;
              for (const entry of tree) {
                queue.push(entry.oid);
                oids.add(entry.oid); // Add tree entries directly to oids
                this.logger.debug(
                  `Added ${entry.type} ${entry.oid} from tree ${oid}`,
                );
              }
              break;
            }

            case 'blob':
              oids.add(oid); // Add blobs directly to oids
              this.logger.debug(`Added blob ${oid}`);
              break;

            default:
              this.logger.warn(`Unknown object type: ${obj.type} for ${oid}`);
          }
        } catch (error) {
          this.logger.error(`Error processing object ${oid}:`, error);
          // Don't throw here, continue processing other objects
          this.logger.warn(`Skipping problematic object ${oid}`);
        }
      }

      this.logger.debug(
        `Creating packfile with ${oids.size} objects:`,
        Array.from(oids),
      );

      const packfile = await git.packObjects({
        fs,
        dir,
        oids: Array.from(oids),
        write: false,
      });

      if (!packfile?.packfile || packfile.packfile.length === 0) {
        throw new Error('Generated packfile is empty');
      }

      this.logger.debug(
        `Packfile created successfully, size: ${packfile.packfile.length}`,
      );
      return { packfile: Buffer.from(packfile.packfile) };
    } catch (error) {
      this.logger.error('Packfile generation failed:', error);
      throw new Error(`Failed to generate packfile: ${error.message}`);
    }
  }
}
