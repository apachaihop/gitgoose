import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommitsService } from './commits.service';
import { CommitsResolver } from './commits.resolver';
import { Commit } from './entities/commit.entity';
import { AuthModule } from 'src/auth/auth.module';
import { GitClientModule } from '../git-client/git-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([Commit]), AuthModule, GitClientModule],
  providers: [CommitsResolver, CommitsService],
  exports: [CommitsService],
})
export class CommitsModule {}
