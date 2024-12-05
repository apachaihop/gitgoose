import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GitClientService } from './git-client.service';
import { CommitSyncService } from './commit-sync.service';
import { AuthModule } from '../auth/auth.module';
import { Commit } from '../commits/entities/commit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Commit]), AuthModule],
  providers: [GitClientService, CommitSyncService],
  exports: [GitClientService],
})
export class GitClientModule {}
