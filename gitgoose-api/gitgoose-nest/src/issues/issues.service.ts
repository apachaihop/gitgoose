import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from './entities/issue.entity';
import { CreateIssueInput } from './dto/create-issue.input';
import { UpdateIssueInput } from './dto/update-issue.input';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
  ) {}

  async create(createIssueInput: CreateIssueInput): Promise<Issue> {
    const issue = this.issueRepository.create({
      ...createIssueInput,
      state: 'open',
      labels: [],
    });

    // Get the highest issue number for the repository and increment it
    const highestIssue = await this.issueRepository.findOne({
      where: { repositoryId: createIssueInput.repositoryId },
      order: { number: 'DESC' },
    });

    issue.number = highestIssue ? highestIssue.number + 1 : 1;
    return await this.issueRepository.save(issue);
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
    return await this.issueRepository.save(issue);
  }

  async removeAssignee(id: string, assigneeId: string): Promise<Issue> {
    const issue = await this.findOne(id);
    issue.assignees = issue.assignees.filter(
      (assignee) => assignee.id !== assigneeId,
    );
    return await this.issueRepository.save(issue);
  }
}
