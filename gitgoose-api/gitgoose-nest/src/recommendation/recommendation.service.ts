import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Repo } from '../repos/entities/repo.entity';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Repo)
    private repoRepository: Repository<Repo>,
  ) {}

  private async getUserLanguagePreferences(
    starredRepos: Repo[],
  ): Promise<Map<string, number>> {
    const languagePreferences = new Map<string, number>();

    for (const repo of starredRepos) {
      if (repo.primaryLanguage) {
        languagePreferences.set(
          repo.primaryLanguage,
          (languagePreferences.get(repo.primaryLanguage) || 0) + 1,
        );
      }
    }

    return languagePreferences;
  }

  async getTrendingReposForUser(userId: string): Promise<Repo[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'starredRepositories',
        'following',
        'starredRepositories.languageStatsEntities',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const starredRepoIds =
      user.starredRepositories?.map((repo) => repo.id) || [];
    const followingUserIds = user.following?.map((user) => user.id) || [];
    const languagePreferences = await this.getUserLanguagePreferences(
      user.starredRepositories || [],
    );

    if (followingUserIds.length === 0) {
      return this.getGeneralTrendingRepos(starredRepoIds, languagePreferences);
    }

    const trendingRepos = await this.repoRepository
      .createQueryBuilder('repo')
      .leftJoinAndSelect('repo.owner', 'owner')
      .leftJoinAndSelect('repo.languageStatsEntities', 'languageStats')
      .where('repo.isPrivate = :isPrivate', { isPrivate: false })
      .andWhere(
        starredRepoIds.length > 0
          ? 'repo.id NOT IN (:...starredRepoIds)'
          : '1=1',
        { starredRepoIds },
      )
      .andWhere('owner.id IN (:...followingUserIds)', { followingUserIds })
      .orderBy('repo.starsCount', 'DESC')
      .addOrderBy('repo.updatedAt', 'DESC')
      .take(20) // Get more repos initially for filtering
      .getMany();

    // Sort repos based on language preferences
    const sortedRepos = this.sortReposByLanguagePreference(
      trendingRepos,
      languagePreferences,
    );

    if (sortedRepos.length < 10) {
      const additionalRepos = await this.getGeneralTrendingRepos(
        [...starredRepoIds, ...trendingRepos.map((repo) => repo.id)],
        languagePreferences,
        10 - sortedRepos.length,
      );
      return [...sortedRepos, ...additionalRepos];
    }

    return sortedRepos.slice(0, 10);
  }

  private sortReposByLanguagePreference(
    repos: Repo[],
    languagePreferences: Map<string, number>,
  ): Repo[] {
    return repos.sort((a, b) => {
      const aScore = this.calculateLanguageScore(a, languagePreferences);
      const bScore = this.calculateLanguageScore(b, languagePreferences);
      if (bScore !== aScore) {
        return bScore - aScore;
      }
      // If language scores are equal, sort by stars
      return b.starsCount - a.starsCount;
    });
  }

  private calculateLanguageScore(
    repo: Repo,
    preferences: Map<string, number>,
  ): number {
    if (!repo.primaryLanguage) return 0;
    return preferences.get(repo.primaryLanguage) || 0;
  }

  private async getGeneralTrendingRepos(
    excludeRepoIds: string[],
    languagePreferences: Map<string, number>,
    limit: number = 10,
  ): Promise<Repo[]> {
    const repos = await this.repoRepository
      .createQueryBuilder('repo')
      .leftJoinAndSelect('repo.owner', 'owner')
      .leftJoinAndSelect('repo.languageStatsEntities', 'languageStats')
      .where('repo.isPrivate = :isPrivate', { isPrivate: false })
      .andWhere(
        excludeRepoIds.length > 0
          ? 'repo.id NOT IN (:...excludeRepoIds)'
          : '1=1',
        { excludeRepoIds },
      )
      .orderBy('repo.starsCount', 'DESC')
      .addOrderBy('repo.updatedAt', 'DESC')
      .take(20) // Get more repos initially for filtering
      .getMany();

    const sortedRepos = this.sortReposByLanguagePreference(
      repos,
      languagePreferences,
    );
    return sortedRepos.slice(0, limit);
  }
}
