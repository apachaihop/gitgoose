import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesService } from './branches.service';
import { BranchesResolver } from './branches.resolver';
import { Branch } from './entities/branch.entity';
import { GitClientModule } from '../git-client/git-client.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Branch, User]),
    GitClientModule,
    AuthModule,
  ],
  providers: [BranchesResolver, BranchesService],
})
export class BranchesModule {}
