import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { GetActivitiesInput } from './dto/get-activities.input';
import { ActivityType } from './enums/activity-type.enum';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async findByUser(
    userId: string,
    input?: GetActivitiesInput,
  ): Promise<Activity[]> {
    const days = input?.days || 7;
    const limit = input?.limit || 10;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.activityRepository.find({
      where: {
        user: { id: userId },
        timestamp: MoreThanOrEqual(startDate),
      },
      relations: {
        repository: {
          owner: true,
        },
        user: true,
      },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async createActivity(data: {
    userId: string;
    type: ActivityType;
    description: string;
    repositoryId: string;
  }): Promise<Activity> {
    const activity = this.activityRepository.create({
      userId: data.userId,
      type: data.type,
      description: data.description,
      repositoryId: data.repositoryId,
    });

    return this.activityRepository.save(activity);
  }
}
