import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repo } from '../repos/entities/repo.entity';
import { RecommendationService } from '../recommendation/recommendation.service';
import { SocialResolver } from './social.resolver';
import { SocialService } from './social.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Repo])],
  providers: [SocialResolver, SocialService, RecommendationService],
})
export class SocialModule {}
