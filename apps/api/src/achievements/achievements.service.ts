import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.achievement.findMany({
      orderBy: { category: 'asc' },
      include: { _count: { select: { users: { where: { isCompleted: true } } } } },
    });
  }

  async getUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async earn(userId: string, achievementId: string) {
    const existing = await this.prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } },
    });

    if (existing && existing.isCompleted) {
      return { message: 'Already earned' };
    }

    if (existing) {
      await this.prisma.userAchievement.update({
        where: { id: existing.id },
        data: { isCompleted: true, earnedAt: new Date() },
      });
    } else {
      await this.prisma.userAchievement.create({
        data: { userId, achievementId, isCompleted: true, earnedAt: new Date() },
      });
    }

    // Track activity
    const achievement = await this.prisma.achievement.findUnique({ where: { id: achievementId } });
    await this.prisma.activity.create({
      data: {
        userId,
        type: 'ACHIEVEMENT_EARNED',
        targetType: 'achievement',
        targetId: achievementId,
        content: { name: achievement?.name },
      },
    });

    return { earned: true };
  }

  async checkAndAward(userId: string) {
    // Check various conditions and award achievements automatically
    const watchlistCount = await this.prisma.watchlist.count({ where: { userId } });
    const completedCount = await this.prisma.watchlist.count({ where: { userId, status: 'COMPLETED' } });
    const ratingCount = await this.prisma.rating.count({ where: { userId } });

    const conditions = [
      { count: watchlistCount, threshold: 10, achievementKey: 'WATCHLIST_10' },
      { count: watchlistCount, threshold: 50, achievementKey: 'WATCHLIST_50' },
      { count: completedCount, threshold: 5, achievementKey: 'COMPLETED_5' },
      { count: completedCount, threshold: 25, achievementKey: 'COMPLETED_25' },
      { count: ratingCount, threshold: 10, achievementKey: 'RATER_10' },
    ];

    for (const condition of conditions) {
      if (condition.count >= condition.threshold) {
        const achievement = await this.prisma.achievement.findFirst({
          where: { name: condition.achievementKey },
        });
        if (achievement) {
          await this.earn(userId, achievement.id).catch(() => {});
        }
      }
    }
  }
}