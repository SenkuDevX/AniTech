import { Injectable, Logger } from '@nestjs/common';
import MeiliSearch from 'meilisearch';

@Injectable()
export class MeilisearchService {
  private readonly logger = new Logger(MeilisearchService.name);
  private client: MeiliSearch | null = null;
  private available = false;

  constructor() {
    const host = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
    const apiKey = process.env.MEILISEARCH_API_KEY;

    if (host) {
      try {
        this.client = new MeiliSearch({ host, apiKey });
        this.available = true;
        this.logger.log(`Meilisearch connected to ${host}`);
      } catch {
        this.logger.warn('Meilisearch unavailable, using PG fallback');
      }
    }
  }

  isAvailable(): boolean {
    return this.available && this.client !== null;
  }

  getClient(): MeiliSearch {
    if (!this.client) throw new Error('Meilisearch not available');
    return this.client;
  }

  async search(
    query: string,
    options: {
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
    const client = this.getClient();
    const index = client.index('anime');

    const filterParts: string[] = [];
    if (options.genres?.length) filterParts.push(`genres IN [${options.genres.map(g => `"${g}"`).join(',')}]`);
    if (options.status) filterParts.push(`status = "${options.status}"`);
    if (options.format) filterParts.push(`format = "${options.format}"`);
    if (options.year) filterParts.push(`seasonYear = ${options.year}`);
    if (options.season) filterParts.push(`season = "${options.season}"`);

    const sortBy: string[] = [];
    switch (options.sort) {
      case 'score': sortBy.push('avgScore:desc'); break;
      case 'title': sortBy.push('title:asc'); break;
      case 'latest': sortBy.push('startDate:desc'); break;
      case 'trending': sortBy.push('popularity:desc'); break;
      default: sortBy.push(`popularity:desc`);
    }

    const searchResults = await index.search(query, {
      limit: options.perPage,
      offset: (options.page - 1) * options.perPage,
      filter: filterParts.length ? filterParts.join(' AND ') : undefined,
      sort: sortBy,
      attributesToRetrieve: [
        'id', 'title', 'titleEn', 'titleJp', 'slug', 'coverImage',
        'posterImage', 'format', 'avgScore', 'popularity', 'status',
        'episodes', 'genres',
      ],
    });

    const results = searchResults.hits.map((hit: any) => ({
      id: hit.id,
      title: hit.title,
      titleEn: hit.titleEn,
      titleJp: hit.titleJp,
      slug: hit.slug,
      coverImage: hit.coverImage,
      posterImage: hit.posterImage,
      format: hit.format,
      avgScore: hit.avgScore,
      popularity: hit.popularity,
      status: hit.status,
      episodes: hit.episodes,
      genres: hit.genres || [],
    }));

    return {
      results,
      total: (searchResults as any).totalHits ?? (searchResults as any).estimatedTotalHits ?? searchResults.hits.length,
      page: options.page,
      perPage: options.perPage,
    };
  }

  async getSuggestions(query: string): Promise<any[]> {
    const client = this.getClient();
    const index = client.index('anime');

    const results = await index.search(query, {
      limit: 5,
      attributesToRetrieve: ['id', 'title', 'slug', 'coverImage', 'format'],
    });

    return results.hits;
  }

  async indexAnime(animeData: any) {
    const client = this.getClient();
    const index = client.index('anime');
    await index.addDocuments([animeData]);
  }

  async removeAnime(id: string) {
    const client = this.getClient();
    const index = client.index('anime');
    await index.deleteDocument(id);
  }

  async configureIndex() {
    const client = this.getClient();
    const index = client.index('anime');

    await index.updateSettings({
      searchableAttributes: [
        'title',
        'titleEn',
        'titleJp',
        'titleRomanji',
        'synopsis',
        'tags',
      ],
      filterableAttributes: ['genres', 'status', 'format', 'season', 'seasonYear', 'isAdult'],
      sortableAttributes: ['popularity', 'avgScore', 'startDate', 'title'],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
        'popularity:desc',
      ],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
      },
      synonyms: {
        'anime': ['animation', 'cartoon', 'show'],
        'manga': ['comic'],
      },
    });
  }
}