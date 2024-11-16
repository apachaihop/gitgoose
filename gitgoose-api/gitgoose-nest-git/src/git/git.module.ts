import { Module } from '@nestjs/common';
import { GitService } from './git.service';
import { GitGateway } from './git.gateway';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [GitService, GitGateway],
})
export class GitModule {}
