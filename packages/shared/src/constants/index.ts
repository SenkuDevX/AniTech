export const AUTHENTICATION_CONSTANTS = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  GUEST_TOKEN_EXPIRY: '24h',
  MAX_DEVICES: 10,
  MIN_PASSWORD_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;

export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 50,
} as const;

export const CACHE_CONSTANTS = {
  DEFAULT_TTL: 60 * 5, // 5 minutes
  POPULAR_ANIME_TTL: 60 * 10, // 10 minutes
  USER_SESSION_TTL: 60 * 60 * 24 * 7, // 7 days
  SEARCH_RESULTS_TTL: 60 * 2, // 2 minutes
  RATE_LIMIT_TTL: 60, // 1 minute
} as const;

export const RECOMMENDATION_CONSTANTS = {
  DEFAULT_COUNT: 12,
  MAX_COUNT: 50,
  MIN_WATCH_HISTORY_FOR_RECOMMENDATIONS: 5,
  POPULARITY_DECAY_DAYS: 30,
} as const;

export const WATCH_PARTY_CONSTANTS = {
  SYNC_INTERVAL_MS: 500,
  SYNC_THRESHOLD_MS: 2000,
  MAX_PARTICIPANTS: 100,
  DEFAULT_MAX_USERS: 50,
  MESSAGE_HISTORY_LIMIT: 100,
} as const;

export const DOWNLOAD_CONSTANTS = {
  MAX_CONCURRENT_DOWNLOADS: 3,
  CHUNK_SIZE: 1024 * 1024, // 1MB
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000, // 5 seconds
} as const;

export const PLUGIN_CONSTANTS = {
  MAX_PLUGIN_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_PERMISSIONS: [
    'storage.read',
    'storage.write',
    'network.request',
    'ui.extension',
    'playback.control',
    'provider.register',
    'theme.register',
    'notification.send',
    'analytics.track',
  ] as const,
  SANDBOX_TIMEOUT: 30000, // 30 seconds
} as const;

export const SEARCH_CONSTANTS = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 200,
  DEFAULT_FUZZINESS: 2,
  RESULTS_PER_PAGE: 20,
  MAX_RESULTS_PER_PAGE: 50,
} as const;

export const NOTIFICATION_CONSTANTS = {
  BATCH_SIZE: 20,
  MAX_BATCH_AGE: 5 * 60 * 1000, // 5 minutes
} as const;

export const ANALYTICS_CONSTANTS = {
  BATCH_SIZE: 100,
  FLUSH_INTERVAL: 60 * 1000, // 1 minute
  MAX_QUEUE_SIZE: 1000,
} as const;
