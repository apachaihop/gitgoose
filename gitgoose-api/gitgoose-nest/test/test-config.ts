import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../src/auth/entities/user.entity';
import { Repo } from '../src/repos/entities/repo.entity';
import { PullRequest } from '../src/pull_requests/entities/pull_request.entity';
import { Issue } from '../src/issues/entities/issue.entity';
import { Branch } from '../src/branches/entities/branch.entity';

export const testConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'myuser',
  password: 'mypassword',
  database: 'myapp',
  entities: [User, Repo, PullRequest, Issue, Branch],
  synchronize: true,
  dropSchema: true,
};
