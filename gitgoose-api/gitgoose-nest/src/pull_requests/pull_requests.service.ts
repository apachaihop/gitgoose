import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PullRequest } from './entities/pull_request.entity';
import { CreatePullRequestInput } from './dto/create-pull_request.input';
import { UpdatePullRequestInput } from './dto/update-pull_request.input';
import { GitClientService } from '../git-client/git-client.service';
import { Repository } from 'typeorm';

@Injectable()
export class PullRequestsService {
  constructor(
    @InjectRepository(PullRequest)
    private pullRequestRepository: Repository<PullRequest>,
    private gitClientService: GitClientService,
  ) {}

  async create(
    createPullRequestInput: CreatePullRequestInput,
  ): Promise<PullRequest> {
    const pullRequest = this.pullRequestRepository.create({
      ...createPullRequestInput,
      state: 'open',
      isDraft: false,
      isMerged: false,
    });

    // Get the highest PR number for the repository and increment it
    const highestPR = await this.pullRequestRepository.findOne({
      where: { repositoryId: createPullRequestInput.repositoryId },
      order: { number: 'DESC' },
    });

    pullRequest.number = highestPR ? highestPR.number + 1 : 1;
    return await this.pullRequestRepository.save(pullRequest);
  }

  async findAll(): Promise<PullRequest[]> {
    return await this.pullRequestRepository.find({
      relations: ['author', 'repository', 'reviewers'],
    });
  }

  async findOne(id: string): Promise<PullRequest> {
    const pullRequest = await this.pullRequestRepository.findOne({
      where: { id },
      relations: ['author', 'repository', 'reviewers'],
    });

    if (!pullRequest) {
      throw new NotFoundException(`Pull request with ID ${id} not found`);
    }

    return pullRequest;
  }

  async findByRepository(repositoryId: string): Promise<PullRequest[]> {
    return await this.pullRequestRepository.find({
      where: { repositoryId },
      relations: ['author', 'reviewers'],
    });
  }

  async update(
    id: string,
    updatePullRequestInput: UpdatePullRequestInput,
  ): Promise<PullRequest> {
    const pullRequest = await this.findOne(id);
    Object.assign(pullRequest, updatePullRequestInput);
    return await this.pullRequestRepository.save(pullRequest);
  }

  async merge(id: string, userId: string): Promise<PullRequest> {
    const pullRequest = await this.findOne(id);

    if (pullRequest.isMerged) {
      throw new Error('Pull request is already merged');
    }

    if (pullRequest.state !== 'open') {
      throw new Error('Can only merge open pull requests');
    }

    try {
      // Fetch latest changes from both branches
      await this.gitClientService.pull({
        repoId: pullRequest.repositoryId,
        branch: pullRequest.targetBranch,
      });

      await this.gitClientService.pull({
        repoId: pullRequest.repositoryId,
        branch: pullRequest.sourceBranch,
      });

      // Try to merge source into target
      try {
        await this.gitClientService.handleBranchOperation({
          repoId: pullRequest.repositoryId,
          operation: 'merge',
          branch: pullRequest.targetBranch,
          sourceBranch: pullRequest.sourceBranch,
          targetBranch: pullRequest.targetBranch,
        });
      } catch (error) {
        if (error.message.includes('CONFLICTS')) {
          pullRequest.hasConflicts = true;
          await this.pullRequestRepository.save(pullRequest);
          throw new Error(
            'Merge conflicts detected. Please resolve conflicts manually.',
          );
        }
        throw error;
      }

      // Create merge commit
      await this.gitClientService.createCommit({
        repoId: pullRequest.repositoryId,
        message: `Merge pull request #${pullRequest.number} from ${pullRequest.sourceBranch}`,
        branch: pullRequest.targetBranch,
        authorId: userId,
        authorName: 'System',
        authorEmail: 'system@gitgoose.com',
        files: [], // Files are already staged by the merge operation
      });

      // Push changes
      await this.gitClientService.push({
        repoId: pullRequest.repositoryId,
        branch: pullRequest.targetBranch,
      });

      // Update PR status
      pullRequest.isMerged = true;
      pullRequest.mergedAt = new Date();
      pullRequest.mergedById = userId;
      pullRequest.state = 'closed';

      return await this.pullRequestRepository.save(pullRequest);
    } catch (error) {
      throw new Error(`Failed to merge pull request: ${error.message}`);
    }
  }

  async remove(id: string): Promise<PullRequest> {
    const pullRequest = await this.findOne(id);
    return await this.pullRequestRepository.remove(pullRequest);
  }

  async addReviewer(id: string, reviewerId: string): Promise<PullRequest> {
    const pullRequest = await this.findOne(id);
    if (!pullRequest.reviewers) {
      pullRequest.reviewers = [];
    }
    pullRequest.reviewers.push({ id: reviewerId } as any);
    return await this.pullRequestRepository.save(pullRequest);
  }

  async removeReviewer(id: string, reviewerId: string): Promise<PullRequest> {
    const pullRequest = await this.findOne(id);
    pullRequest.reviewers = pullRequest.reviewers.filter(
      (reviewer) => reviewer.id !== reviewerId,
    );
    return await this.pullRequestRepository.save(pullRequest);
  }
}
