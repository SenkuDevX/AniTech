import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  deviceInfo: z.object({
    name: z.string(),
    type: z.enum(['DESKTOP', 'MOBILE', 'TABLET', 'TV', 'WEB', 'UNKNOWN']),
    os: z.string().optional(),
    osVersion: z.string().optional(),
    appVersion: z.string().optional(),
  }).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(128),
});

export const createWatchlistSchema = z.object({
  animeId: z.string().cuid(),
  status: z.enum(['PLAN_TO_WATCH', 'WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED']),
  score: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(2000).optional(),
  isPrivate: z.boolean().optional(),
});

export const updateWatchlistSchema = z.object({
  status: z.enum(['PLAN_TO_WATCH', 'WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED']).optional(),
  score: z.number().int().min(1).max(10).optional(),
  progress: z.number().int().min(0).optional(),
  notes: z.string().max(2000).optional(),
  isPrivate: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  customTags: z.array(z.string().max(30)).max(20).optional(),
});

export const createReviewSchema = z.object({
  animeId: z.string().cuid(),
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(10000),
  score: z.number().int().min(1).max(10),
  isSpoiler: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
});

export const createCommentSchema = z.object({
  targetType: z.string(),
  targetId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
  content: z.string().min(1).max(5000),
  isSpoiler: z.boolean().optional(),
});

export const createWatchPartySchema = z.object({
  animeId: z.string().cuid(),
  episodeId: z.string().cuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().optional(),
  password: z.string().optional(),
  maxUsers: z.number().int().min(2).max(100).optional(),
});

export const createPluginSchema = z.object({
  manifest: z.object({
    name: z.string(),
    version: z.string(),
    author: z.string(),
    description: z.string().optional(),
    permissions: z.array(z.string()).optional(),
    entryPoint: z.string(),
    configSchema: z.record(z.any()).optional(),
  }),
  entryPoint: z.string(),
});

export const updateSettingsSchema = z.object({
  language: z.string().optional(),
  subtitleLanguage: z.string().optional(),
  subtitleFontSize: z.number().int().min(10).max(32).optional(),
  subtitleColor: z.string().optional(),
  subtitleBgOpacity: z.number().min(0).max(1).optional(),
  subtitleOffset: z.number().int().optional(),
  themeId: z.string().optional(),
  autoSkipIntro: z.boolean().optional(),
  autoSkipOutro: z.boolean().optional(),
  autoNextEpisode: z.boolean().optional(),
  defaultQuality: z.string().optional(),
  defaultPlaybackSpeed: z.number().min(0.25).max(4.0).optional(),
  volume: z.number().min(0).max(1).optional(),
  muted: z.boolean().optional(),
  enableNotifications: z.boolean().optional(),
  enableDesktopNotifications: z.boolean().optional(),
  privacyProfile: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']).optional(),
  privacyWatchlist: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']).optional(),
  privacyActivity: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']).optional(),
  showAdultContent: z.boolean().optional(),
  dataAnalytics: z.boolean().optional(),
  syncEnabled: z.boolean().optional(),
  preferredProviders: z.array(z.string()).optional(),
});

export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(['anime', 'user', 'episode', 'all']).optional(),
  genres: z.array(z.string()).optional(),
  season: z.enum(['WINTER', 'SPRING', 'SUMMER', 'FALL']).optional(),
  year: z.number().int().optional(),
  status: z.enum(['NOT_YET_RELEASED', 'RELEASING', 'FINISHED', 'CANCELLED', 'HIATUS']).optional(),
  format: z.enum(['TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA', 'MUSIC']).optional(),
  sort: z.enum(['popularity', 'score', 'title', 'latest', 'trending']).optional(),
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).max(50).optional(),
});

export const updatePlaybackProgressSchema = z.object({
  animeId: z.string().cuid(),
  episodeId: z.string().cuid(),
  progress: z.number().int().min(0),
  duration: z.number().int().optional(),
  completed: z.boolean().optional(),
  playbackSpeed: z.number().optional(),
  quality: z.string().optional(),
  subtitleLang: z.string().optional(),
});
