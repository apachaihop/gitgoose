import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from './entities/issue.entity';
import { CreateIssueInput } from './dto/create-issue.input';
import { UpdateIssueInput } from './dto/update-issue.input';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType } from '../activities/enums/activity-type.enum';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    private activitiesService: ActivitiesService,
  ) {}

  async create(createIssueInput: CreateIssueInput): Promise<Issue> {
    const lastIssueInRepo = await this.issueRepository.findOne({
      where: { repositoryId: createIssueInput.repositoryId },
      order: { number: 'DESC' },
    });

    const issueNumber = lastIssueInRepo ? lastIssueInRepo.number + 1 : 1;

    const issue = this.issueRepository.create({
      ...createIssueInput,
      number: issueNumber,
    });

    const savedIssue = await this.issueRepository.save(issue);

    await this.activitiesService.createActivity({
      userId: createIssueInput.authorId,
      type: ActivityType.ISSUE_CREATE,
      description: `Created issue #${savedIssue.number}: ${savedIssue.title}`,
      repositoryId: createIssueInput.repositoryId,
    });

    return savedIssue;
  }

  async findAll(): Promise<Issue[]> {
    return await this.issueRepository.find({
      relations: ['author', 'repository', 'assignees'],
    });
  }

  async findOne(id: string): Promise<Issue> {
    const issue = await this.issueRepository.findOne({
      where: { id },
      relations: ['author', 'repository', 'assignees'],
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    return issue;
  }

  async findByRepository(repositoryId: string): Promise<Issue[]> {
    return await this.issueRepository.find({
      where: { repositoryId },
      relations: ['author', 'assignees'],
    });
  }

  async update(id: string, updateIssueInput: UpdateIssueInput): Promise<Issue> {
    const issue = await this.findOne(id);

    if (updateIssueInput.state && updateIssueInput.state !== issue.state) {
      await this.activitiesService.createActivity({
        userId: updateIssueInput.authorId,
        type:
          updateIssueInput.state === 'closed'
            ? ActivityType.ISSUE_CLOSE
            : ActivityType.ISSUE_REOPEN,
        description: `${updateIssueInput.state === 'closed' ? 'Closed' : 'Reopened'} issue #${issue.number}`,
        repositoryId: issue.repositoryId,
      });
    }

    Object.assign(issue, updateIssueInput);
    return await this.issueRepository.save(issue);
  }

  async remove(id: string): Promise<Issue> {
    const issue = await this.findOne(id);
    return await this.issueRepository.remove(issue);
  }

  async addLabel(id: string, label: string): Promise<Issue> {
    const issue = await this.findOne(id);
    if (!issue.labels.includes(label)) {
      issue.labels.push(label);
      return await this.issueRepository.save(issue);
    }
    return issue;
  }

  async removeLabel(id: string, label: string): Promise<Issue> {
    const issue = await this.findOne(id);
    issue.labels = issue.labels.filter((l) => l !== label);
    return await this.issueRepository.save(issue);
  }

  async addAssignee(id: string, assigneeId: string): Promise<Issue> {
    const issue = await this.findOne(id);
    if (!issue.assignees) {
      issue.assignees = [];
    }
    issue.assignees.push({ id: assigneeId } as any);

    await this.activitiesService.createActivity({
      userId: assigneeId,
      type: ActivityType.ISSUE_ASSIGN,
      description: `Assigned to issue #${issue.number}`,
      repositoryId: issue.repositoryId,
    });

    return await this.issueRepository.save(issue);
  }

  async removeAssignee(id: string, assigneeId: string): Promise<Issue> {
    const issue = await this.findOne(id);
    issue.assignees = issue.assignees.filter(
      (assignee) => assignee.id !== assigneeId,
    );
    return await this.issueRepository.save(issue);
  }

  async findByAuthor(authorId: string): Promise<Issue[]> {
    return await this.issueRepository.find({
      where: { authorId },
      relations: ['repository'],
      order: { createdAt: 'DESC' },
    });
  }

  async assign(issueId: string, assigneeId: string): Promise<Issue> {
    return await this.addAssignee(issueId, assigneeId);
  }

  async unassign(issueId: string, assigneeId: string): Promise<Issue> {
    return await this.removeAssignee(issueId, assigneeId);
  }

  async changeState(issueId: string, state: string): Promise<Issue> {
    const issue = await this.findOne(issueId);
    issue.state = state;
    return await this.issueRepository.save(issue);
  }
}
