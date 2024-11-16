import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReposService } from './repos.service';
import { ReposResolver } from './repos.resolver';
import { Repo } from './entities/repo.entity';
import { Commit } from '../commits/entities/commit.entity';
import { GitClientModule } from '../git-client/git-client.module';
import { FilesResolver } from './files.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Repo, Commit]), GitClientModule],
  providers: [ReposResolver, ReposService, FilesResolver],
  exports: [ReposService],
})
export class ReposModule {}
