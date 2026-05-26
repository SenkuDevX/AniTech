import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPersonalized(userId: string, limit = 12) {
    // Get genres user watches most
    const watchEntries = await this.prisma.watchlist.findMany({
      where: { userId },
      include: {
        anime: {
          include: { genres: { include: { genre: true } } },
        },
      },
    });

    const genreCount = new Map<string, number>();
    for (const entry of watchEntries) {
      for (const g of entry.anime.genres) {
        genreCount.set(g.genre.name, (genreCount.get(g.genre.name) || 0) + 1);
      }
    }

    const topGenres = [...genreCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    // Get existing watchlist anime IDs to exclude
    const watchedIds = new Set(watchEntries.map((e: any) => e.animeId));

    // Find recommendations based on top genres
    const recommendations = await this.prisma.anime.findMany({
      where: {
        id: { notIn: [...watchedIds] },
        isAdult: false,
        genres: {
          some: {
            genre: { name: { in: topGenres } },
          },
        },
      },
      orderBy: { avgScore: 'desc' },
      take: limit,
      include: {
        genres: { include: { genre: { select: { id: true, name: true } } } },
      },
    });

    // If not enough personalized, fill with popular
    if (recommendations.length < limit) {
      const fillCount = limit - recommendations.length;
      const fillIds = recommendations.map((r: any) => r.id);
      const filler = await this.prisma.anime.findMany({
        where: {
          id: { notIn: [...watchedIds, ...fillIds] },
          isAdult: false,
        },
        orderBy: { popularity: 'desc' },
        take: fillCount,
        include: {
          genres: { include: { genre: { select: { id: true, name: true } } } },
        },
      });
      recommendations.push(...filler);
    }

    return recommendations;
  }

  async getTrending(limit = 12) {
    return this.prisma.anime.findMany({
      where: { isAdult: false },
      orderBy: { popularity: 'desc' },
      take: limit,
      include: {
        genres: { include: { genre: { select: { id: true, name: true } } } },
      },
    });
  }

  async getSimilar(animeId: string, limit = 6) {
    const anime = await this.prisma.anime.findUnique({
      where: { id: animeId },
      include: { genres: { include: { genre: true } } },
    });

    if (!anime) return [];

    const genreIds = anime.genres.map((g: any) => g.genreId);

    return this.prisma.anime.findMany({
      where: {
        id: { not: animeId },
        isAdult: false,
        genres: {
          some: {
            genreId: { in: genreIds },
          },
        },
      },
      orderBy: { avgScore: 'desc' },
      take: limit,
      include: {
        genres: { include: { genre: { select: { id: true, name: true } } } },
      },
    });
  }

  async getHiddenGems(userId: string, limit = 6) {
    return this.prisma.anime.findMany({
      where: {
        isAdult: false,
        isHiddenGem: true,
        popularity: { lte: 500 },
        avgScore: { gte: 7.5 },
      },
      orderBy: { avgScore: 'desc' },
      take: limit,
      include: {
        genres: { include: { genre: { select: { id: true, name: true } } } },
      },
    });
  }

  async getUsersWhoWatched(animeId: string, limit = 6) {
    // Find users who have this anime in their watchlist
    const watchers = await this.prisma.watchlist.findMany({
      where: { animeId, status: { in: ['WATCHING', 'COMPLETED'] } },
      select: { userId: true },
      take: 100,
    });

    const watcherIds = watchers.map((w: any) => w.userId);
    if (watcherIds.length === 0) return [];

    // Find what else those users watch (excluding the target anime)
    const otherWatchlists = await this.prisma.watchlist.findMany({
      where: {
        userId: { in: watcherIds },
        animeId: { not: animeId },
        status: { in: ['WATCHING', 'COMPLETED', 'PLAN_TO_WATCH'] },
      },
      select: { animeId: true },
    });

    // Count frequency
    const freq = new Map<string, number>();
    for (const w of otherWatchlists) {
      freq.set(w.animeId, (freq.get(w.animeId) || 0) + 1);
    }

    const topIds = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    return this.prisma.anime.findMany({
      where: { id: { in: topIds } },
      include: {
        genres: { include: { genre: { select: { id: true, name: true } } } },
      },
    });
  }

  async dismiss(userId: string, animeId: string) {
    await this.prisma.recommendation.upsert({
      where: { userId_animeId: { userId, animeId } },
      update: { isDismissed: true },
      create: { userId, animeId, score: 0, algorithm: 'manual', isDismissed: true },
    });

    return { dismissed: true };
  }

  async trackClick(userId: string, animeId: string) {
    await this.prisma.recommendation.upsert({
      where: { userId_animeId: { userId, animeId } },
      update: { isClicked: true },
      create: { userId, animeId, score: 0, algorithm: 'manual', isClicked: true },
    });

    return { tracked: true };
  }
}