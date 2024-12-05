import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PullRequest } from './entities/pull_request.entity';
import { CreatePullRequestInput } from './dto/create-pull_request.input';
import { UpdatePullRequestInput } from './dto/update-pull_request.input';
import { GitClientService } from '../git-client/git-client.service';
import { Repository } from 'typeorm';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType } from '../activities/enums/activity-type.enum';

@Injectable()
export class PullRequestsService {
  constructor(
    @InjectRepository(PullRequest)
    private pullRequestRepository: Repository<PullRequest>,
    private gitClientService: GitClientService,
    private activitiesService: ActivitiesService,
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
      relations: ['author', 'repository', 'reviewers', 'comments'],
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
      // Use merge operation directly instead of branch operation
      try {
        await this.gitClientService.merge({
          repoId: pullRequest.repositoryId,
          sourceBranch: pullRequest.sourceBranch,
          targetBranch: pullRequest.targetBranch,
          message: `Merge pull request #${pullRequest.number} from ${pullRequest.sourceBranch}`,
          author: {
            name: 'System',
            email: 'system@gitgoose.com',
          },
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

      // Update PR status
      pullRequest.isMerged = true;
      pullRequest.mergedAt = new Date();
      pullRequest.mergedById = userId;
      pullRequest.state = 'closed';

      // Record activity
      await this.activitiesService.createActivity({
        userId,
        type: ActivityType.PR_MERGE,
        description: `Merged pull request #${pullRequest.number} into ${pullRequest.targetBranch}`,
        repositoryId: pullRequest.repositoryId,
      });

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

  async findByAuthor(authorId: string): Promise<PullRequest[]> {
    return await this.pullRequestRepository.find({
      where: { authorId },
      relations: ['repository'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByReviewer(reviewerId: string): Promise<PullRequest[]> {
    return await this.pullRequestRepository.find({
      where: { reviewers: { id: reviewerId } },
      relations: ['repository', 'author'],
      order: { createdAt: 'DESC' },
    });
  }
}
