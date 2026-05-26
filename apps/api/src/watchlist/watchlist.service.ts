import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AddToWatchlistDto, UpdateWatchlistEntryDto } from './dto';

@Injectable()
export class WatchlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getWatchlist(
    userId: string,
    filters: {
      status?: string;
      sort?: string;
      page: number;
      perPage: number;
    },
  ) {
    const where: any = { userId };
    if (filters.status) where.status = filters.status;

    const orderBy: any = {};
    switch (filters.sort) {
      case 'score': orderBy.score = 'desc'; break;
      case 'updated': orderBy.updatedAt = 'desc'; break;
      case 'title': orderBy.anime = { title: 'asc' }; break;
      default: orderBy.updatedAt = 'desc';
    }

    const skip = (filters.page - 1) * filters.perPage;

    const [results, total] = await Promise.all([
      this.prisma.watchlist.findMany({
        where,
        orderBy,
        skip,
        take: filters.perPage,
        include: {
          anime: {
            include: {
              genres: { include: { genre: { select: { id: true, name: true } } } },
            },
          },
        },
      }),
      this.prisma.watchlist.count({ where }),
    ]);

    return { results, total, page: filters.page, perPage: filters.perPage };
  }

  async getContinueWatching(userId: string) {
    const entries = await this.prisma.watchlist.findMany({
      where: { userId, status: 'WATCHING' },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        anime: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            episodes: true,
            format: true,
          },
        },
      },
    });

    // Enrich with latest watch history
    const enriched = await Promise.all(
      entries.map(async (entry: any) => {
        const lastProgress = await this.prisma.watchHistory.findFirst({
          where: { userId, animeId: entry.animeId },
          orderBy: { updatedAt: 'desc' },
          include: { episode: { select: { number: true, title: true } } },
        });

        return { ...entry, lastProgress };
      }),
    );

    return enriched;
  }

  async getStats(userId: string) {
    const [watching, completed, planToWatch, onHold, dropped, totalEpisodes, totalDays] = await Promise.all([
      this.prisma.watchlist.count({ where: { userId, status: 'WATCHING' } }),
      this.prisma.watchlist.count({ where: { userId, status: 'COMPLETED' } }),
      this.prisma.watchlist.count({ where: { userId, status: 'PLAN_TO_WATCH' } }),
      this.prisma.watchlist.count({ where: { userId, status: 'ON_HOLD' } }),
      this.prisma.watchlist.count({ where: { userId, status: 'DROPPED' } }),
      this.prisma.watchHistory.count({ where: { userId } }),
      this.prisma.watchHistory.aggregate({ where: { userId }, _sum: { duration: true } }),
    ]);

    return {
      watching,
      completed,
      planToWatch,
      onHold,
      dropped,
      totalEpisodes,
      totalDaysWatched: totalDays._sum.duration ? Math.round(totalDays._sum.duration / 86400) : 0,
      totalAnime: watching + completed + planToWatch + onHold + dropped,
    };
  }

  async add(userId: string, dto: AddToWatchlistDto) {
    return this.prisma.watchlist.upsert({
      where: { userId_animeId: { userId, animeId: dto.animeId } },
      update: { status: dto.status as any, score: dto.score, notes: dto.notes },
      create: {
        userId,
        animeId: dto.animeId,
        status: dto.status as any,
        score: dto.score,
        notes: dto.notes,
        totalEps: dto.totalEps,
      },
      include: {
        anime: { select: { id: true, title: true, slug: true, coverImage: true } },
      },
    });
  }

  async update(userId: string, animeId: string, dto: UpdateWatchlistEntryDto) {
    const entry = await this.prisma.watchlist.findUnique({
      where: { userId_animeId: { userId, animeId } },
    });
    if (!entry) throw new NotFoundException('Watchlist entry not found');

    return this.prisma.watchlist.update({
      where: { id: entry.id },
      data: {
        ...(dto.status && { status: dto.status as any }),
        ...(dto.score != null && { score: dto.score }),
        ...(dto.progress != null && { progress: dto.progress }),
        ...(dto.notes != null && { notes: dto.notes }),
        ...(dto.isPrivate != null && { isPrivate: dto.isPrivate }),
        ...(dto.isFavorite != null && { isFavorite: dto.isFavorite }),
        ...(dto.customTags && { customTags: dto.customTags }),
      },
      include: {
        anime: { select: { id: true, title: true, slug: true } },
      },
    });
  }

  async remove(userId: string, animeId: string) {
    const entry = await this.prisma.watchlist.findUnique({
      where: { userId_animeId: { userId, animeId } },
    });
    if (!entry) throw new NotFoundException('Watchlist entry not found');

    await this.prisma.watchlist.delete({
      where: { id: entry.id },
    });
  }

  async rate(userId: string, animeId: string, score: number) {
    return this.prisma.rating.upsert({
      where: { userId_animeId: { userId, animeId } },
      update: { score },
      create: { userId, animeId, score },
    });
  }

  async review(
    userId: string,
    animeId: string,
    data: { title: string; content: string; score: number; isSpoiler: boolean },
  ) {
    // Upsert rating
    await this.prisma.rating.upsert({
      where: { userId_animeId: { userId, animeId } },
      update: { score: data.score },
      create: { userId, animeId, score: data.score },
    });

    return this.prisma.review.create({
      data: {
        userId,
        animeId,
        title: data.title,
        content: data.content,
        score: data.score,
        isSpoiler: data.isSpoiler,
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { likesList: true } },
      },
    });
  }
}