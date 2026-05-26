export interface SearchableAnime {
  id: string;
  title: string;
  titleEn?: string;
  titleJp?: string;
  titleRomanji?: string;
  synopsis?: string;
  coverImage?: string;
  posterImage?: string;
  avgScore?: number;
  popularity?: number;
  status: string;
  format: string;
  episodes?: number;
  season?: string;
  seasonYear?: number;
  genres: string[];
  tags?: string[];
  isAdult: boolean;
  createdAt: Date;
}

export interface SearchOptions {
  q: string;
  limit?: number;
  offset?: number;
  genres?: string[];
  status?: string;
  format?: string;
  season?: string;
  seasonYear?: number;
  minScore?: number;
  sort?: string;
}

export interface SearchResult<T> {
  hits: T[];
  total: number;
  offset: number;
  limit: number;
  processingTimeMs: number;
}

export const MEILISEARCH_INDEXES = {
  ANIME: 'anime',
  USERS: 'users',
  PLUGINS: 'plugins',
} as const;
