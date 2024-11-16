import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssuesService } from './issues.service';
import { IssuesResolver } from './issues.resolver';
import { Issue } from './entities/issue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Issue])],
  providers: [IssuesService, IssuesResolver],
  exports: [IssuesService],
})
export class IssuesModule {}
