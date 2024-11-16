import { Module } from '@nestjs/common';
import { GitController } from './git.controller';
import { GitClientModule } from '../git-client/git-client.module';
import { ReposModule } from '../repos/repos.module';

@Module({
  imports: [ReposModule, GitClientModule],
  controllers: [GitController],
})
export class GitModule {}
