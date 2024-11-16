import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as LightningFS from '@isomorphic-git/lightning-fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private fs: LightningFS;
  private readonly baseDir: string;

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
    return path.join(this.baseDir, repoId);
  }

  async ensureRepoDirectory(repoId: string): Promise<string> {
    const repoPath = await this.getRepoPath(repoId);
    try {
      await fs.mkdir(repoPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
    return repoPath;
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
      await fs.mkdir(dir, { recursive: true });
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
