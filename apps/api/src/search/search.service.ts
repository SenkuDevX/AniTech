import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SearchDto, GetPopularSearchesDto } from './dto';
import { MeilisearchService } from './meilisearch.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meilisearch: MeilisearchService,
  ) {}

  // Mood-to-tag mapping for mood-based discovery
  private readonly moodTags: Record<string, string[]> = {
    dark: ['dark', 'psychological', 'horror', 'thriller', 'seinen', 'tragedy'],
    chill: ['slice of life', 'iyashikei', 'comedy', 'romance', 'school', 'music'],
    hype: ['action', 'shounen', 'battle', 'super power', 'martial arts', 'mecha'],
    sad: ['drama', 'tragedy', 'emotional', 'romance', 'melodrama'],
    romantic: ['romance', 'shoujo', 'love', 'harem', 'josei'],
    funny: ['comedy', 'gag', 'parody', 'slapstick', 'school'],
    epic: ['adventure', 'fantasy', 'military', 'super power', 'shounen', 'sci-fi'],
    mysterious: ['mystery', 'thriller', 'supernatural', 'psychological', 'horror'],
    relaxing: ['slice of life', 'iyashikei', 'music', 'school', 'comedy'],
    intense: ['action', 'thriller', 'horror', 'psychological', 'seinen'],
  };

  async search(userId: string, dto: SearchDto) {
    const {
      q,
      type = 'anime',
      genres,
      season,
      year,
      status,
      format,
      mood,
      sort = 'popularity',
      page = 1,
      perPage = 20,
    } = dto;

    // Derive genre tags from mood if specified
    const moodGenres = mood ? this.moodTags[mood.toLowerCase()] : undefined;
    const allGenres = genres ? [...genres, ...(moodGenres || [])] : moodGenres;

    // Use Meilisearch for full-text search
    if (this.meilisearch.isAvailable()) {
      return this.meilisearch.search(q, {
        type,
        genres: allGenres,
        season,
        year,
        status,
        format,
        sort,
        page,
        perPage,
        userId,
      });
    }

    // Fallback to PostgreSQL full-text search
    return this.pgSearch(q, { type, genres: allGenres, season, year, status, format, sort, page, perPage, userId });
  }

  private async pgSearch(
    query: string,
    filters: {
      type?: string;
      genres?: string[];
      season?: string;
      year?: number;
      status?: string;
      format?: string;
      sort?: string;
      page: number;
      perPage: number;
      userId: string;
    },
  ) {
    const where: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { titleEn: { contains: query, mode: 'insensitive' } },
        { titleJp: { contains: query, mode: 'insensitive' } },
        { titleRomanji: { contains: query, mode: 'insensitive' } },
        { synopsis: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters.genres && filters.genres.length > 0) {
      where.genres = {
        some: {
          genre: {
            name: { in: filters.genres, mode: 'insensitive' },
          },
        },
      };
    }

    if (filters.season) where.season = filters.season;
    if (filters.year) where.seasonYear = filters.year;
    if (filters.status) where.status = filters.status;
    if (filters.format) where.format = filters.format;

    const orderBy: any = {};
    switch (filters.sort) {
      case 'score': orderBy.avgScore = 'desc'; break;
      case 'title': orderBy.title = 'asc'; break;
      case 'latest': orderBy.startDate = 'desc'; break;
      case 'trending': orderBy.popularity = 'desc'; break;
      default: orderBy.popularity = 'desc';
    }

    const skip = (filters.page - 1) * filters.perPage;

    const [results, total] = await Promise.all([
      this.prisma.anime.findMany({
        where,
        orderBy,
        skip,
        take: filters.perPage,
        select: {
          id: true,
          title: true,
          titleEn: true,
          titleJp: true,
          slug: true,
          coverImage: true,
          posterImage: true,
          format: true,
          avgScore: true,
          popularity: true,
          status: true,
          episodes: true,
          genres: {
            select: {
              genre: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.anime.count({ where }),
    ]);

    return { results, total, page: filters.page, perPage: filters.perPage };
  }

  async getSuggestions(userId: string, query: string) {
    if (!query || query.length < 2) return [];

    if (this.meilisearch.isAvailable()) {
      return this.meilisearch.getSuggestions(query);
    }

    return this.prisma.anime.findMany({
      where: {
        OR: [
          { title: { startsWith: query, mode: 'insensitive' } },
          { titleEn: { startsWith: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        format: true,
      },
    });
  }

  async getPopularSearches(userId: string, dto: GetPopularSearchesDto) {
    const limit = dto.limit || 10;

    const searches = await this.prisma.searchQuery.groupBy({
      by: ['query'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    return searches.map((s: any) => ({ query: s.query, count: s._count.id }));
  }

  async getRecentSearches(userId: string) {
    return this.prisma.searchQuery.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      distinct: ['query'],
      select: {
        id: true,
        query: true,
        createdAt: true,
      },
    });
  }

  async addRecentSearch(userId: string, query: string) {
    return this.prisma.searchQuery.create({
      data: { userId, query },
    });
  }

  async removeRecentSearch(userId: string, query: string) {
    await this.prisma.searchQuery.deleteMany({
      where: { userId, query },
    });
  }

  async trackSearchQuery(userId: string, query: string, results: number, type?: string) {
    return this.prisma.searchQuery.create({
      data: { userId, query, results, filters: { type } },
    });
  }
}