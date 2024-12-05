import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchInput } from './dto/create-branch.input';
import { UpdateBranchInput } from './dto/update-branch.input';
import { GitClientService } from '../git-client/git-client.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    private gitClientService: GitClientService,
    private userService: AuthService,
  ) {}

  async create(createBranchInput: CreateBranchInput): Promise<Branch> {
    // Check if branch already exists
    const existingBranch = await this.branchRepository.findOne({
      where: {
        repositoryId: createBranchInput.repositoryId,
        name: createBranchInput.name,
      },
    });

    if (existingBranch) {
      throw new Error(
        `Branch "${createBranchInput.name}" already exists in this repository`,
      );
    }

    // Get the latest commit from source branch
    const sourceCommits = await this.gitClientService.getCommitHistory(
      createBranchInput.repositoryId,
      createBranchInput.sourceBranch || 'main',
    );

    const latestCommit = sourceCommits[0];

    // Create branch in Git
    await this.gitClientService.createBranch({
      repoId: createBranchInput.repositoryId,
      name: createBranchInput.name,
      sourceBranch: createBranchInput.sourceBranch || 'main',
    });

    // Create branch record in database with last commit info
    const userId = await this.userService.getUserIdByEmail(
      latestCommit?.author?.email,
    );
    const branch = this.branchRepository.create({
      ...createBranchInput,
      lastCommitSha: latestCommit?.sha,
      lastCommitMessage: latestCommit?.message || 'Branch created',
      lastCommitAuthorId: userId || null,
      isProtected: false,
    });

    return await this.branchRepository.save(branch);
  }

  async findAll(): Promise<Branch[]> {
    return await this.branchRepository.find({
      relations: ['repository', 'lastCommitAuthor'],
    });
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: ['repository', 'lastCommitAuthor'],
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return branch;
  }

  async findByRepository(repositoryId: string): Promise<Branch[]> {
    // Get branches from Git
    const gitBranches = await this.gitClientService.getBranches(repositoryId);

    // Get branches from database
    const dbBranches = await this.branchRepository.find({
      where: { repositoryId },
      relations: ['lastCommitAuthor'],
    });

    for (const gitBranch of gitBranches as any[]) {
      const dbBranch = dbBranches.find((b) => b.name === gitBranch.name);
      if (!dbBranch) {
        const newBranch = this.branchRepository.create({
          repositoryId,
          name: gitBranch.name,
          lastCommitSha: gitBranch.sha,
          lastCommitMessage: gitBranch.message || '',
          lastCommitAuthorId: gitBranch.authorId,
          isProtected: false,
        });
        dbBranches.push(await this.branchRepository.save(newBranch));
      } else if (dbBranch.lastCommitSha !== gitBranch.sha) {
        // Update existing branch
        await this.updateLastCommit(
          dbBranch.id,
          gitBranch.sha,
          gitBranch.message || 'Updated from Git',
          gitBranch.authorId || dbBranch.lastCommitAuthorId,
        );
      }
    }

    return dbBranches;
  }

  async update(
    id: string,
    updateBranchInput: UpdateBranchInput,
  ): Promise<Branch> {
    const branch = await this.findOne(id);
    Object.assign(branch, updateBranchInput);
    return await this.branchRepository.save(branch);
  }

  async remove(id: string): Promise<Branch> {
    const branch = await this.findOne(id);

    if (branch.isProtected) {
      throw new Error('Cannot delete protected branch');
    }

    // Delete branch in Git
    await this.gitClientService.handleBranchOperation({
      repoId: branch.repositoryId,
      operation: 'delete',
      branch: branch.name,
    });

    return await this.branchRepository.remove(branch);
  }

  async setProtected(id: string, isProtected: boolean): Promise<Branch> {
    const branch = await this.findOne(id);
    branch.isProtected = isProtected;
    return await this.branchRepository.save(branch);
  }

  async updateLastCommit(
    id: string,
    sha: string,
    message: string,
    authorId: string,
  ): Promise<Branch> {
    const branch = await this.findOne(id);
    branch.lastCommitSha = sha;
    branch.lastCommitMessage = message;
    branch.lastCommitAuthorId = authorId;
    return await this.branchRepository.save(branch);
  }

  async setBranchProtection(input: {
    repositoryId: string;
    branch: string;
    requirePullRequest: boolean;
    requiredReviewers: number;
    requireStatusChecks: boolean;
  }): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: {
        repositoryId: input.repositoryId,
        name: input.branch,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    branch.isProtected = true;
    branch.protectionRules = {
      requirePullRequest: input.requirePullRequest,
      requiredReviewers: input.requiredReviewers,
      requireStatusChecks: input.requireStatusChecks,
    };

    return await this.branchRepository.save(branch);
  }

  async updateBranchMetadata(
    repoId: string,
    branchName: string,
    lastCommit: any,
  ): Promise<void> {
    try {
      const branch = await this.branchRepository.findOne({
        where: {
          repositoryId: repoId,
          name: branchName,
        },
      });

      if (!branch) {
        // Create new branch record if it doesn't exist
        const newBranch = this.branchRepository.create({
          repositoryId: repoId,
          name: branchName,
          lastCommitSha: lastCommit.sha,
          lastCommitMessage: lastCommit.message,
          lastCommitAuthorId: lastCommit.authorId,
          isProtected: false,
        });
        await this.branchRepository.save(newBranch);
      } else {
        // Update existing branch
        branch.lastCommitSha = lastCommit.sha;
        branch.lastCommitMessage = lastCommit.message;
        branch.lastCommitAuthorId = lastCommit.authorId;
        await this.branchRepository.save(branch);
      }
    } catch (error) {
      throw new Error(`Failed to update branch metadata: ${error.message}`);
    }
  }
}
