import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async create(createCommentInput: CreateCommentInput): Promise<Comment> {
    const comment = this.commentRepository.create(createCommentInput);
    return await this.commentRepository.save(comment);
  }

  async findByPullRequest(pullRequestId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { pullRequestId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async resolve(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    comment.isResolved = true;
    return await this.commentRepository.save(comment);
  }

  async remove(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return await this.commentRepository.remove(comment);
  }

  async findByAuthor(authorId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { authorId },
      relations: ['pullRequest'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPath(pullRequestId: string, path: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { pullRequestId, path },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, body: string): Promise<Comment> {
    const comment = await this.findOne(id);
    comment.body = body;
    return await this.commentRepository.save(comment);
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'pullRequest']
    });
    
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    
    return comment;
  }
}
