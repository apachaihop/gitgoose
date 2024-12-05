import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { AdminRole } from '../auth/enums/admin-role.enum';
import { UserStats } from './types/user-stats.type';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async promoteToAdmin(userId: string, roles: AdminRole[]): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isAdmin = true;
    user.roles = [...new Set([...user.roles, ...roles])];
    return await this.userRepository.save(user);
  }

  async revokeAdmin(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isAdmin = false;
    user.roles = user.roles.filter(
      (role) => !Object.values(AdminRole).includes(role as AdminRole),
    );
    return await this.userRepository.save(user);
  }

  async getUserStats(): Promise<UserStats> {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });
    const adminUsers = await this.userRepository.count({
      where: { isAdmin: true },
    });

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      inactiveUsers: totalUsers - activeUsers,
    };
  }

  async suspendUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isAdmin) {
      throw new ForbiddenException('Cannot suspend admin users');
    }

    user.isActive = false;
    return await this.userRepository.save(user);
  }

  async unsuspendUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = true;
    return await this.userRepository.save(user);
  }

  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }
}
