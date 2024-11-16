import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PullRequestsService } from './pull_requests.service';
import { PullRequestsResolver } from './pull_requests.resolver';
import { PullRequest } from './entities/pull_request.entity';
import { GitClientModule } from '../git-client/git-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([PullRequest]), GitClientModule],
  providers: [PullRequestsResolver, PullRequestsService],
  exports: [PullRequestsService],
})
export class PullRequestsModule {}
