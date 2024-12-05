import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ReposModule } from './repos/repos.module';
import { PullRequestsModule } from './pull_requests/pull_requests.module';
import { IssuesModule } from './issues/issues.module';
import { BranchesModule } from './branches/branches.module';
import { Repo } from './repos/entities/repo.entity';
import { PullRequest } from './pull_requests/entities/pull_request.entity';
import { Issue } from './issues/entities/issue.entity';
import { Branch } from './branches/entities/branch.entity';
import { User } from './auth/entities/user.entity';
import { CommitsModule } from './commits/commits.module';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { GraphQLJSONObject } from 'graphql-type-json';
import { CommentsModule } from './comments/comments.module';
import { GitClientModule } from './git-client/git-client.module';
import { join } from 'path';
import { ActivitiesModule } from './activities/activities.module';
import { GitModule } from './git/git.module';
import { RouterModule } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';
import { SocialModule } from './social/social.module';
import { MetricsModule } from './metrics/metrics.module';
import { MetricsMiddleware } from './metrics/metrics.middleware';
import {
  requestCounterProvider,
  requestDurationProvider,
} from './metrics/metric.decorators';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      buildSchemaOptions: {
        dateScalarMode: 'timestamp',
      },
      resolvers: {
        JSON: GraphQLJSONObject,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'postgres'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'gitgoose'),
        password: configService.get('DB_PASSWORD', 'gitgoose'),
        database: configService.get('DB_DATABASE', 'gitgoose'),
        entities: [User, Repo, PullRequest, Issue, Branch],
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ReposModule,
    PullRequestsModule,
    IssuesModule,
    BranchesModule,
    CommitsModule,
    CommentsModule,
    GitClientModule,
    ActivitiesModule,
    GitModule,
    RouterModule.register([
      {
        path: 'git',
        module: GitModule,
      },
    ]),
    AdminModule,
    SocialModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService, requestCounterProvider, requestDurationProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
