import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Repo } from '../repos/entities/repo.entity';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Repo)
    private repoRepository: Repository<Repo>,
  ) {}

  async starRepository(repoId: string, userId: string): Promise<Repo> {
    const [repo, user] = await Promise.all([
      this.repoRepository.findOne({ where: { id: repoId } }),
      this.userRepository.findOne({ where: { id: userId } }),
    ]);

    if (!repo || !user) {
      throw new NotFoundException('Repository or user not found');
    }

    await user.starRepository(repo);
    repo.starsCount++;
    repo.isStarredByViewer = true;

    await Promise.all([
      this.userRepository.save(user),
      this.repoRepository.save(repo),
    ]);

    return repo;
  }

  async unstarRepository(repoId: string, userId: string): Promise<Repo> {
    const [repo, user] = await Promise.all([
      this.repoRepository.findOne({ where: { id: repoId } }),
      this.userRepository.findOne({
        where: { id: userId },
        relations: ['starredRepositories'],
      }),
    ]);

    if (!repo || !user) {
      throw new NotFoundException('Repository or user not found');
    }

    user.starredRepositories = user.starredRepositories.filter(
      (r) => r.id !== repoId,
    );
    repo.starsCount = Math.max(0, repo.starsCount - 1);
    repo.isStarredByViewer = false;

    await Promise.all([
      this.userRepository.save(user),
      this.repoRepository.save(repo),
    ]);

    return repo;
  }

  async watchRepository(repoId: string, userId: string): Promise<Repo> {
    const repo = await this.repoRepository.findOne({ where: { id: repoId } });
    if (!repo) {
      throw new NotFoundException('Repository not found');
    }

    repo.watchersCount++;
    repo.isWatchedByViewer = true;
    return await this.repoRepository.save(repo);
  }

  async unwatchRepository(repoId: string, userId: string): Promise<Repo> {
    const repo = await this.repoRepository.findOne({ where: { id: repoId } });
    if (!repo) {
      throw new NotFoundException('Repository not found');
    }

    repo.watchersCount = Math.max(0, repo.watchersCount - 1);
    repo.isWatchedByViewer = false;
    return await this.repoRepository.save(repo);
  }

  async followUser(targetUserId: string, followerId: string): Promise<User> {
    const [targetUser, follower] = await Promise.all([
      this.userRepository.findOne({ where: { id: targetUserId } }),
      this.userRepository.findOne({ where: { id: followerId } }),
    ]);

    if (!targetUser || !follower) {
      throw new NotFoundException('User not found');
    }

    await targetUser.addFollower(follower);
    await follower.addFollowing(targetUser);

    targetUser.isFollowedByViewer = true;

    await Promise.all([
      this.userRepository.save(targetUser),
      this.userRepository.save(follower),
    ]);

    return targetUser;
  }

  async unfollowUser(targetUserId: string, followerId: string): Promise<User> {
    const [targetUser, follower] = await Promise.all([
      this.userRepository.findOne({
        where: { id: targetUserId },
        relations: ['followers'],
      }),
      this.userRepository.findOne({
        where: { id: followerId },
        relations: ['following'],
      }),
    ]);

    if (!targetUser || !follower) {
      throw new NotFoundException('User not found');
    }

    targetUser.followers = targetUser.followers.filter(
      (u) => u.id !== followerId,
    );
    follower.following = follower.following.filter(
      (u) => u.id !== targetUserId,
    );

    targetUser.followersCount = Math.max(0, targetUser.followersCount - 1);
    follower.followingCount = Math.max(0, follower.followingCount - 1);
    targetUser.isFollowedByViewer = false;

    await Promise.all([
      this.userRepository.save(targetUser),
      this.userRepository.save(follower),
    ]);

    return targetUser;
  }
}
