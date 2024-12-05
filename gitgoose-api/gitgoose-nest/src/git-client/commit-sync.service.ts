import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commit } from '../commits/entities/commit.entity';
import { AuthService } from '../auth/auth.service';
import { CommitInfo } from './interfaces/git-operation.interface';

@Injectable()
export class CommitSyncService {
  constructor(
    @InjectRepository(Commit)
    private commitRepository: Repository<Commit>,
    private authService: AuthService,
  ) {}

  async syncCommits(
    repositoryId: string,
    commits: CommitInfo[],
  ): Promise<void> {
    for (const commit of commits) {
      try {
        const existingCommit = await this.commitRepository.findOne({
          where: { repositoryId, sha: commit.sha },
        });

        if (!existingCommit) {
          const authorId =
            (await this.authService.getUserIdByEmail(commit.author?.email)) ||
            '00000000-0000-0000-0000-000000000000';

          const newCommit = this.commitRepository.create({
            sha: commit.sha,
            message: commit.message,
            authorName: commit.author?.name || 'System',
            authorEmail: commit.author?.email || 'system@gitgoose.com',
            authorId,
            repositoryId,
            parentShas: [],
            isMergeCommit: false,
          });

          await this.commitRepository.save(newCommit);
        }
      } catch (error) {
        console.error(`Failed to sync commit ${commit.sha}:`, error);
      }
    }
  }
}
