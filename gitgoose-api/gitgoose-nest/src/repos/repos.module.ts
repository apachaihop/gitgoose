import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReposService } from './repos.service';
import { ReposResolver } from './repos.resolver';
import { Repo } from './entities/repo.entity';
import { Commit } from '../commits/entities/commit.entity';
import { GitClientModule } from '../git-client/git-client.module';
import { FilesResolver } from './files.resolver';
import { Branch } from '../branches/entities/branch.entity';
import { RepoCollaborator } from './entities/repo_collaborator.entity';
import { ActivitiesModule } from '../activities/activities.module';
import { User } from 'src/auth/entities/user.entity';
import { CommitsModule } from '../commits/commits.module';
import { AuthModule } from '../auth/auth.module';
import { LanguageAnalyzerService } from './language-analyzer.service';
import { LanguageStats } from './entities/language-stats.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Repo,
      Commit,
      Branch,
      RepoCollaborator,
      User,
      LanguageStats,
    ]),
    GitClientModule,
    ActivitiesModule,
    CommitsModule,
    AuthModule,
  ],
  providers: [
    ReposResolver,
    ReposService,
    FilesResolver,
    LanguageAnalyzerService,
  ],
  exports: [ReposService],
})
export class ReposModule {}
