import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesService } from './branches.service';
import { BranchesResolver } from './branches.resolver';
import { Branch } from './entities/branch.entity';
import { GitClientModule } from '../git-client/git-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([Branch]), GitClientModule],
  providers: [BranchesResolver, BranchesService],
})
export class BranchesModule {}
