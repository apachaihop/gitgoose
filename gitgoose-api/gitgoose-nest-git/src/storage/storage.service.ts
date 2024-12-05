import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as LightningFS from '@isomorphic-git/lightning-fs';
import * as path from 'path';
import { join } from 'path';
import { Logger } from '@nestjs/common';
@Injectable()
export class StorageService {
  private fs: LightningFS;
  private readonly baseDir: string;
  private readonly logger = new Logger(StorageService.name);
  constructor() {
    this.fs = new LightningFS();
    this.baseDir = process.env.STORAGE_PATH || './repositories';
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async getRepoPath(repoId: string): Promise<string> {
    const path = join(this.baseDir, repoId);
    this.logger.debug(`Resolving repo path for ${repoId}: ${path}`);

    // Verify the directory exists and is a Git repository
    const exists = await fs
      .access(path)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      this.logger.error(`Repository directory not found: ${path}`);
      throw new Error(`Repository directory not found: ${repoId}`);
    }

    const isGitRepo = await fs
      .access(join(path, '.git'))
      .then(() => true)
      .catch(() => false);

    if (!isGitRepo) {
      this.logger.error(`Not a Git repository: ${path}`);
      throw new Error(`Not a Git repository: ${repoId}`);
    }

    // Add additional logging for debugging
    this.logger.debug(`Repository verified at path: ${path}`);

    try {
      const files = await fs.readdir(join(path, '.git', 'objects'));
      this.logger.debug(
        `Git objects directory contains: ${files.length} entries`,
      );
    } catch (error) {
      this.logger.error(`Failed to read objects directory: ${error.message}`);
    }

    return path;
  }

  async ensureRepoDirectory(repoId: string): Promise<string> {
    const repoPath = path.join(this.baseDir, repoId);
    this.logger.debug(`Ensuring repo directory exists at: ${repoPath}`);

    try {
      // Create the repository directory first
      await fs.mkdir(repoPath, { recursive: true });

      // Create .git directory structure
      const gitDir = path.join(repoPath, '.git');
      await fs.mkdir(gitDir, { recursive: true });

      // Create essential Git directories
      await Promise.all([
        fs.mkdir(path.join(gitDir, 'objects'), { recursive: true }),
        fs.mkdir(path.join(gitDir, 'refs', 'heads'), { recursive: true }),
        fs.mkdir(path.join(gitDir, 'refs', 'tags'), { recursive: true }),
        fs.mkdir(path.join(gitDir, 'info'), { recursive: true }),
        fs.mkdir(path.join(gitDir, 'hooks'), { recursive: true }),
      ]);

      // Create essential Git files
      await Promise.all([
        fs.writeFile(path.join(gitDir, 'HEAD'), 'ref: refs/heads/main\n'),
        fs.writeFile(
          path.join(gitDir, 'config'),
          '[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n',
        ),
        fs.writeFile(
          path.join(gitDir, 'description'),
          'Unnamed repository; edit this file to name the repository.\n',
        ),
      ]);

      this.logger.debug(
        `Repository directory structure created at: ${repoPath}`,
      );
      return repoPath;
    } catch (error) {
      this.logger.error(
        `Failed to create repository directory: ${error.message}`,
      );
      throw new Error(
        `Failed to create repository directory: ${error.message}`,
      );
    }
  }

  getFS(): LightningFS {
    return this.fs;
  }

  async writeFile(
    repoId: string,
    filePath: string,
    content: string,
  ): Promise<void> {
    const fullPath = path.join(this.baseDir, repoId, filePath);
    const dir = path.dirname(fullPath);

    try {
      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });
      // Write the file
      await fs.writeFile(fullPath, content, 'utf8');
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  async readFile(repoId: string, filePath: string): Promise<string> {
    const fullPath = path.join(this.baseDir, repoId, filePath);
    try {
      return await fs.readFile(fullPath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async listFiles(repoId: string, dirPath: string = '/'): Promise<string[]> {
    const fullPath = path.join(this.baseDir, repoId, dirPath);
    try {
      const entries = await fs.readdir(fullPath);
      const files: string[] = [];

      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry);
        const stat = await fs.stat(path.join(fullPath, entry));

        if (stat.isDirectory()) {
          const subFiles = await this.listFiles(repoId, entryPath);
          files.push(...subFiles);
        } else {
          files.push(entryPath);
        }
      }

      return files;
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  async deleteFile(repoId: string, filePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, repoId, filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
