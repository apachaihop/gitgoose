import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { ActivitiesResolver } from './activities.resolver';
import { ActivitiesService } from './activities.service';

@Module({
  imports: [TypeOrmModule.forFeature([Activity])],
  providers: [ActivitiesResolver, ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
