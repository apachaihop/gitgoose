import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { User } from '../auth/entities/user.entity';
import { AdminRole } from '../auth/enums/admin-role.enum';
import { UserStats } from './types/user-stats.type';

@Resolver()
@UseGuards(AdminGuard)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => UserStats, { name: 'userStats' })
  async getUserStats(): Promise<UserStats> {
    return this.adminService.getUserStats();
  }

  @Query(() => [User], { name: 'users' })
  async getUsers(): Promise<User[]> {
    return this.adminService.getUsers();
  }

  @Mutation(() => User)
  async promoteToAdmin(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('roles', { type: () => [String] }) roles: AdminRole[],
  ) {
    return this.adminService.promoteToAdmin(userId, roles);
  }

  @Mutation(() => User)
  async revokeAdmin(@Args('userId', { type: () => ID }) userId: string) {
    return this.adminService.revokeAdmin(userId);
  }

  @Mutation(() => User)
  async suspendUser(@Args('userId', { type: () => ID }) userId: string) {
    return this.adminService.suspendUser(userId);
  }

  @Mutation(() => User)
  async unsuspendUser(@Args('userId', { type: () => ID }) userId: string) {
    return this.adminService.unsuspendUser(userId);
  }
}
