import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { MeilisearchService } from '../search/meilisearch.service';

@Injectable()
export class AnimeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meilisearch: MeilisearchService,
  ) {}

  async list(filters: {
    page: number;
    perPage: number;
    status?: string;
    format?: string;
    season?: string;
    year?: number;
    genre?: string;
    sort?: string;
  }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.format) where.format = filters.format;
    if (filters.season) where.season = filters.season;
    if (filters.year) where.seasonYear = filters.year;
    if (filters.genre) {
      where.genres = { some: { genre: { name: filters.genre } } };
    }

    const orderBy: any = {};
    switch (filters.sort) {
      case 'score': orderBy.avgScore = 'desc'; break;
      case 'title': orderBy.title = 'asc'; break;
      case 'latest': orderBy.startDate = 'desc'; break;
      default: orderBy.popularity = 'desc';
    }

    const skip = (filters.page - 1) * filters.perPage;

    const [results, total] = await Promise.all([
      this.prisma.anime.findMany({
        where,
        orderBy,
        skip,
        take: filters.perPage,
        include: {
          genres: { include: { genre: true } },
          studios: { include: { studio: true } },
          _count: { select: { watchlists: true, ratings: true } },
        },
      }),
      this.prisma.anime.count({ where }),
    ]);

    return { results, total, page: filters.page, perPage: filters.perPage };
  }

  async getFeatured(limit = 10) {
    return this.prisma.anime.findMany({
      where: { isAdult: false },
      orderBy: [{ popularity: 'desc' }, { avgScore: 'desc' }],
      take: limit,
      include: {
        genres: { include: { genre: { select: { id: true, name: true } } } },
        _count: { select: { watchlists: true } },
      },
    });
  }

  async getTrending(limit = 20) {
    return this.prisma.anime.findMany({
      where: { status: 'RELEASING', isAdult: false },
      orderBy: { popularity: 'desc' },
      take: limit,
      include: {
        genres: { include: { genre: { select: { id: true, name: true } } } },
        _count: { select: { watchlists: true } },
      },
    });
  }

  async getSeasonal(limit = 30) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    let season: string;
    if (month >= 0 && month <= 2) season = 'WINTER';
    else if (month >= 3 && month <= 5) season = 'SPRING';
    else if (month >= 6 && month <= 8) season = 'SUMMER';
    else season = 'FALL';

    return this.prisma.anime.findMany({
      where: { season: season as any, seasonYear: year, isAdult: false },
      orderBy: { popularity: 'desc' },
      take: limit,
      include: {
        genres: { include: { genre: { select: { id: true, name: true } } } },
      },
    });
  }

  async getPopular(limit = 20, page = 1) {
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      this.prisma.anime.findMany({
        orderBy: { popularity: 'desc' },
        skip,
        take: limit,
        include: {
          genres: { include: { genre: { select: { id: true, name: true } } } },
          _count: { select: { watchlists: true, ratings: true } },
        },
      }),
      this.prisma.anime.count(),
    ]);

    return { results, total, page, perPage: limit };
  }

  async getById(id: string) {
    const anime = await this.prisma.anime.findUnique({
      where: { id },
      include: {
        genres: { include: { genre: true } },
        studios: { include: { studio: true } },
        characters: { orderBy: { role: 'asc' }, take: 20 },
        relations: {
          include: {
            relatedAnime: {
              select: { id: true, title: true, slug: true, coverImage: true, format: true, avgScore: true },
            },
          },
        },
        _count: { select: { watchlists: true, ratings: true, reviews: true } },
      },
    });

    if (!anime) throw new NotFoundException('Anime not found');

    return anime;
  }

  async getEpisodes(animeId: string) {
    const anime = await this.prisma.anime.findUnique({ where: { id: animeId } });
    if (!anime) throw new NotFoundException('Anime not found');

    return this.prisma.episode.findMany({
      where: { animeId },
      orderBy: { number: 'asc' },
      include: { _count: { select: { subtitleFiles: true } } },
    });
  }

  async getEpisode(animeId: string, episodeId: string) {
    const episode = await this.prisma.episode.findFirst({
      where: { id: episodeId, animeId },
    });

    if (!episode) throw new NotFoundException('Episode not found');
    return episode;
  }

  async getCharacters(animeId: string) {
    const anime = await this.prisma.anime.findUnique({ where: { id: animeId } });
    if (!anime) throw new NotFoundException('Anime not found');

    return this.prisma.character.findMany({
      where: { animeId },
      orderBy: { role: 'asc' },
    });
  }

  async getRelations(animeId: string) {
    const anime = await this.prisma.anime.findUnique({ where: { id: animeId } });
    if (!anime) throw new NotFoundException('Anime not found');

    return this.prisma.animeRelation.findMany({
      where: { animeId },
      include: {
        relatedAnime: {
          select: { id: true, title: true, slug: true, coverImage: true, format: true, avgScore: true },
        },
      },
    });
  }

  async getStaff(animeId: string) {
    const anime = await this.prisma.anime.findUnique({ where: { id: animeId } });
    if (!anime) throw new NotFoundException('Anime not found');

    return this.prisma.animeStaff.findMany({
      where: { animeId },
    });
  }

  async getReviews(animeId: string, page = 1) {
    const perPage = 10;
    const skip = (page - 1) * perPage;

    const [results, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { animeId, isPrivate: false },
        orderBy: { likes: 'desc' },
        skip,
        take: perPage,
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          _count: { select: { likesList: true } },
        },
      }),
      this.prisma.review.count({ where: { animeId, isPrivate: false } }),
    ]);

    return { results, total, page, perPage };
  }

  async toggleLike(userId: string, animeId: string) {
    const existing = await this.prisma.watchlist.findUnique({
      where: { userId_animeId: { userId, animeId } },
    });

    if (existing) {
      await this.prisma.watchlist.update({
        where: { id: existing.id },
        data: { isFavorite: !existing.isFavorite },
      });
      return { favorited: !existing.isFavorite };
    }

    await this.prisma.watchlist.create({
      data: { userId, animeId, status: 'PLAN_TO_WATCH', isFavorite: true },
    });

    return { favorited: true };
  }
}