import { z } from 'zod';

// ============== User Types ==============

export const UserRole = z.enum(['USER', 'MODERATOR', 'ADMIN']);
export type UserRole = z.infer<typeof UserRole>;

export const UserStatus = z.enum(['ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED']);
export type UserStatus = z.infer<typeof UserStatus>;

export const DeviceType = z.enum(['DESKTOP', 'MOBILE', 'TABLET', 'TV', 'WEB', 'UNKNOWN']);
export type DeviceType = z.infer<typeof DeviceType>;

// ============== Anime Types ==============

export const AnimeFormat = z.enum([
  'TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA', 'MUSIC',
  'MANGA', 'NOVEL', 'ONE_SHOT', 'DOUJINSHI', 'MANHWA', 'MANHUA'
]);
export type AnimeFormat = z.infer<typeof AnimeFormat>;

export const AnimeStatus = z.enum(['NOT_YET_RELEASED', 'RELEASING', 'FINISHED', 'CANCELLED', 'HIATUS']);
export type AnimeStatus = z.infer<typeof AnimeStatus>;

export const AnimeSeason = z.enum(['WINTER', 'SPRING', 'SUMMER', 'FALL']);
export type AnimeSeason = z.infer<typeof AnimeSeason>;

export const MediaSource = z.enum([
  'ORIGINAL', 'MANGA', 'LIGHT_NOVEL', 'VISUAL_NOVEL', 'GAME',
  'NOVEL', 'DOUJINSHI', 'ANIME', 'OTHER'
]);
export type MediaSource = z.infer<typeof MediaSource>;

export const CharacterRole = z.enum(['MAIN', 'SUPPORTING', 'BACKGROUND']);
export type CharacterRole = z.infer<typeof CharacterRole>;

export const RelationType = z.enum([
  'ADAPTATION', 'PREQUEL', 'SEQUEL', 'PARENT', 'SIDE_STORY',
  'CHARACTER', 'SUMMARY', 'ALTERNATIVE', 'SPIN_OFF', 'OTHER'
]);
export type RelationType = z.infer<typeof RelationType>;

// ============== Watchlist Types ==============

export const WatchStatus = z.enum(['PLAN_TO_WATCH', 'WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED']);
export type WatchStatus = z.infer<typeof WatchStatus>;

export const WatchSource = z.enum(['STREAMING', 'LOCAL', 'DOWNLOADED']);
export type WatchSource = z.infer<typeof WatchSource>;

// ============== Social Types ==============

export const FriendshipStatus = z.enum(['PENDING', 'ACCEPTED', 'BLOCKED']);
export type FriendshipStatus = z.infer<typeof FriendshipStatus>;

export const ActivityType = z.enum([
  'WATCHED_EPISODE', 'COMPLETED_ANIME', 'RATED_ANIME', 'REVIEWED_ANIME',
  'ADDED_TO_WATCHLIST', 'UPDATED_STATUS', 'JOINED_WATCH_PARTY',
  'CREATED_WATCH_PARTY', 'FAVORITED_ANIME', 'ACHIEVEMENT_EARNED',
  'FOLLOWED_USER', 'FRIEND_REQUEST', 'COMMENTED', 'REACTED', 'CUSTOM'
]);
export type ActivityType = z.infer<typeof ActivityType>;

// ============== Watch Party Types ==============

export const WatchPartyStatus = z.enum(['ACTIVE', 'PAUSED', 'ENDED']);
export type WatchPartyStatus = z.infer<typeof WatchPartyStatus>;

export const PartyRole = z.enum(['HOST', 'CO_HOST', 'VIEWER']);
export type PartyRole = z.infer<typeof PartyRole>;

export const MessageType = z.enum(['TEXT', 'REACTION', 'SYSTEM', 'PLAYBACK_EVENT']);
export type MessageType = z.infer<typeof MessageType>;

// ============== Notification Types ==============

export const NotificationType = z.enum([
  'EPISODE_AIRED', 'NEW_FOLLOWER', 'FRIEND_REQUEST', 'WATCH_PARTY_INVITE',
  'WATCH_PARTY_STARTED', 'REVIEW_LIKED', 'COMMENT_REPLY', 'ACHIEVEMENT_EARNED',
  'RECOMMENDATION', 'SYSTEM_ANNOUNCEMENT', 'PLUGIN_UPDATE', 'DOWNLOAD_COMPLETE',
  'SYNC_COMPLETE'
]);
export type NotificationType = z.infer<typeof NotificationType>;

export const NotificationPriority = z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']);
export type NotificationPriority = z.infer<typeof NotificationPriority>;

// ============== Download Types ==============

export const DownloadStatus = z.enum(['QUEUED', 'DOWNLOADING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED']);
export type DownloadStatus = z.infer<typeof DownloadStatus>;

// ============== Achievement Types ==============

export const AchievementCategory = z.enum(['WATCHING', 'SOCIAL', 'COLLECTION', 'COMMUNITY', 'SPECIAL']);
export type AchievementCategory = z.infer<typeof AchievementCategory>;

export const Rarity = z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']);
export type Rarity = z.infer<typeof Rarity>;

// ============== Privacy Types ==============

export const Privacy = z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']);
export type Privacy = z.infer<typeof Privacy>;

// ============== Sync Types ==============

export const SyncAction = z.enum(['CREATE', 'UPDATE', 'DELETE']);
export type SyncAction = z.infer<typeof SyncAction>;
