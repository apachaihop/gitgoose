import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql_auth/gql_auth.guard';
import { Activity } from './entities/activity.entity';
import { ActivitiesService } from './activities.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { GetActivitiesInput } from './dto/get-activities.input';

@Resolver(() => Activity)
@UseGuards(GqlAuthGuard)
export class ActivitiesResolver {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Query(() => [Activity], { name: 'activities' })
  getUserActivities(
    @CurrentUser() user: User,
    @Args('input', { nullable: true }) input?: GetActivitiesInput,
  ) {
    return this.activitiesService.findByUser(user.id, input);
  }
}
