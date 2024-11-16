import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchInput } from './dto/create-branch.input';
import { UpdateBranchInput } from './dto/update-branch.input';
import { GitClientService } from '../git-client/git-client.service';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    private gitClientService: GitClientService,
  ) {}

  async create(createBranchInput: CreateBranchInput): Promise<Branch> {
    // Create branch in Git
    await this.gitClientService.createBranch({
      repoId: createBranchInput.repositoryId,
      name: createBranchInput.name,
      sourceBranch: 'main', // You might want to make this configurable
    });

    // Create branch record in database
    const branch = this.branchRepository.create({
      ...createBranchInput,
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
    // Update database branches with Git information
    for (const gitBranch of gitBranches as any[]) {
      const dbBranch = dbBranches.find((b) => b.name === gitBranch.name);
      if (dbBranch && dbBranch.lastCommitSha !== gitBranch.sha) {
        await this.updateLastCommit(
          dbBranch.id,
          gitBranch.sha,
          'Updated from Git',
          dbBranch.lastCommitAuthorId,
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
}
