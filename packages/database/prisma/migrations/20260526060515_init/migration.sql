-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'TV', 'WEB', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AnimeFormat" AS ENUM ('TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA', 'MUSIC', 'MANGA', 'NOVEL', 'ONE_SHOT', 'DOUJINSHI', 'MANHWA', 'MANHUA');

-- CreateEnum
CREATE TYPE "AnimeStatus" AS ENUM ('NOT_YET_RELEASED', 'RELEASING', 'FINISHED', 'CANCELLED', 'HIATUS');

-- CreateEnum
CREATE TYPE "AnimeSeason" AS ENUM ('WINTER', 'SPRING', 'SUMMER', 'FALL');

-- CreateEnum
CREATE TYPE "MediaSource" AS ENUM ('ORIGINAL', 'MANGA', 'LIGHT_NOVEL', 'VISUAL_NOVEL', 'GAME', 'NOVEL', 'DOUJINSHI', 'ANIME', 'OTHER');

-- CreateEnum
CREATE TYPE "CharacterRole" AS ENUM ('MAIN', 'SUPPORTING', 'BACKGROUND');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('ADAPTATION', 'PREQUEL', 'SEQUEL', 'PARENT', 'SIDE_STORY', 'CHARACTER', 'SUMMARY', 'ALTERNATIVE', 'SPIN_OFF', 'OTHER');

-- CreateEnum
CREATE TYPE "WatchStatus" AS ENUM ('PLAN_TO_WATCH', 'WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED');

-- CreateEnum
CREATE TYPE "WatchSource" AS ENUM ('STREAMING', 'LOCAL', 'DOWNLOADED');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('WATCHED_EPISODE', 'COMPLETED_ANIME', 'RATED_ANIME', 'REVIEWED_ANIME', 'ADDED_TO_WATCHLIST', 'UPDATED_STATUS', 'JOINED_WATCH_PARTY', 'CREATED_WATCH_PARTY', 'FAVORITED_ANIME', 'ACHIEVEMENT_EARNED', 'FOLLOWED_USER', 'FRIEND_REQUEST', 'COMMENTED', 'REACTED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "WatchPartyStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');

-- CreateEnum
CREATE TYPE "PartyRole" AS ENUM ('HOST', 'CO_HOST', 'VIEWER');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'REACTION', 'SYSTEM', 'PLAYBACK_EVENT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EPISODE_AIRED', 'NEW_FOLLOWER', 'FRIEND_REQUEST', 'WATCH_PARTY_INVITE', 'WATCH_PARTY_STARTED', 'REVIEW_LIKED', 'COMMENT_REPLY', 'ACHIEVEMENT_EARNED', 'RECOMMENDATION', 'SYSTEM_ANNOUNCEMENT', 'PLUGIN_UPDATE', 'DOWNLOAD_COMPLETE', 'SYNC_COMPLETE');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DownloadStatus" AS ENUM ('QUEUED', 'DOWNLOADING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('WATCHING', 'SOCIAL', 'COLLECTION', 'COMMUNITY', 'SPECIAL');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "Privacy" AS ENUM ('PUBLIC', 'FRIENDS', 'PRIVATE');

-- CreateEnum
CREATE TYPE "SyncAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('ANNOUNCEMENT', 'RELEASE', 'FEATURE', 'COMMUNITY', 'GUIDE', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "password_hash" TEXT NOT NULL,
    "avatar_url" TEXT,
    "banner_url" TEXT,
    "bio" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_guest" BOOLEAN NOT NULL DEFAULT false,
    "last_active_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_id" TEXT,
    "token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "refreshed_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL,
    "os" TEXT,
    "os_version" TEXT,
    "app_version" TEXT,
    "last_ip" TEXT,
    "trusted" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anime" (
    "id" TEXT NOT NULL,
    "anilist_id" INTEGER,
    "mal_id" INTEGER,
    "title" TEXT NOT NULL,
    "title_en" TEXT,
    "title_jp" TEXT,
    "title_romanji" TEXT,
    "slug" TEXT NOT NULL,
    "synopsis" TEXT,
    "description" TEXT,
    "cover_image" TEXT,
    "banner_image" TEXT,
    "poster_image" TEXT,
    "trailer_url" TEXT,
    "format" "AnimeFormat",
    "status" "AnimeStatus" NOT NULL,
    "season" "AnimeSeason",
    "season_year" INTEGER,
    "episodes" INTEGER,
    "episodes_aired" INTEGER,
    "duration" INTEGER,
    "chapters" INTEGER,
    "volumes" INTEGER,
    "source" "MediaSource",
    "rating" TEXT,
    "avg_score" DOUBLE PRECISION,
    "popularity" INTEGER DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "next_airing_at" TIMESTAMP(3),
    "is_adult" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden_gem" BOOLEAN NOT NULL DEFAULT false,
    "is_simulcast" BOOLEAN NOT NULL DEFAULT false,
    "airing_schedule" JSONB,
    "external_links" JSONB,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_synced_at" TIMESTAMP(3),

    CONSTRAINT "anime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "episodes" (
    "id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT,
    "title_jp" TEXT,
    "synopsis" TEXT,
    "duration" INTEGER,
    "thumbnail" TEXT,
    "aired_at" TIMESTAMP(3),
    "is_filler" BOOLEAN NOT NULL DEFAULT false,
    "is_recap" BOOLEAN NOT NULL DEFAULT false,
    "is_special" BOOLEAN NOT NULL DEFAULT false,
    "intro_start" INTEGER,
    "intro_end" INTEGER,
    "outro_start" INTEGER,
    "outro_end" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "popularity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anime_genres" (
    "anime_id" TEXT NOT NULL,
    "genre_id" TEXT NOT NULL,

    CONSTRAINT "anime_genres_pkey" PRIMARY KEY ("anime_id","genre_id")
);

-- CreateTable
CREATE TABLE "studios" (
    "id" TEXT NOT NULL,
    "anilist_id" INTEGER,
    "name" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "studios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anime_studios" (
    "anime_id" TEXT NOT NULL,
    "studio_id" TEXT NOT NULL,

    CONSTRAINT "anime_studios_pkey" PRIMARY KEY ("anime_id","studio_id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "anilist_id" INTEGER,
    "name" TEXT NOT NULL,
    "name_jp" TEXT,
    "image" TEXT,
    "description" TEXT,
    "role" "CharacterRole" NOT NULL DEFAULT 'SUPPORTING',
    "voice_actors" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anime_relations" (
    "id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "related_anime_id" TEXT NOT NULL,
    "relation_type" "RelationType" NOT NULL,

    CONSTRAINT "anime_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anime_staff" (
    "id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_jp" TEXT,
    "role" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "anime_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "status" "WatchStatus" NOT NULL,
    "score" INTEGER,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "total_eps" INTEGER,
    "rewatch_count" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "finish_date" TIMESTAMP(3),
    "notes" TEXT,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "custom_tags" TEXT[],
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "episode_id" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "watch_source" "WatchSource" NOT NULL DEFAULT 'STREAMING',
    "playback_speed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "subtitle_lang" TEXT,
    "quality" TEXT,
    "device_id" TEXT,
    "watched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watch_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "review" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "is_spoiler" BOOLEAN NOT NULL DEFAULT false,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_likes" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "review_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "content" JSONB,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "is_spoiler" BOOLEAN NOT NULL DEFAULT false,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment_id" TEXT,
    "target_type" TEXT,
    "target_id" TEXT,
    "emoji" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_parties" (
    "id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "episode_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "max_users" INTEGER NOT NULL DEFAULT 50,
    "status" "WatchPartyStatus" NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watch_parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_party_participants" (
    "id" TEXT NOT NULL,
    "party_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "PartyRole" NOT NULL DEFAULT 'VIEWER',
    "is_ready" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "watch_party_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_party_messages" (
    "id" TEXT NOT NULL,
    "party_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watch_party_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downloads" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "file_path" TEXT,
    "file_size" BIGINT,
    "downloaded" BIGINT NOT NULL DEFAULT 0,
    "status" "DownloadStatus" NOT NULL DEFAULT 'QUEUED',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "quality" TEXT,
    "format" TEXT,
    "error" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "download_items" (
    "id" TEXT NOT NULL,
    "download_id" TEXT NOT NULL,
    "episode_id" TEXT,
    "source_url" TEXT NOT NULL,
    "file_path" TEXT,
    "file_size" BIGINT,
    "downloaded" BIGINT NOT NULL DEFAULT 0,
    "status" "DownloadStatus" NOT NULL DEFAULT 'QUEUED',
    "quality" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "download_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugins" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "manifest" JSONB NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_official" BOOLEAN NOT NULL DEFAULT false,
    "permissions" TEXT[],
    "entry_point" TEXT NOT NULL,
    "config" JSONB,
    "config_schema" JSONB,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "installed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "themes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "colors" JSONB NOT NULL,
    "typography" JSONB,
    "spacing" JSONB,
    "shapes" JSONB,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "algorithm" TEXT NOT NULL,
    "is_clicked" BOOLEAN NOT NULL DEFAULT false,
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_queries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "results" INTEGER NOT NULL DEFAULT 0,
    "clicked_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_documents" (
    "id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "tokens" TEXT[],
    "language" TEXT NOT NULL DEFAULT 'en',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "condition" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "rarity" "Rarity" NOT NULL DEFAULT 'COMMON',

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "earned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "subtitle_language" TEXT NOT NULL DEFAULT 'en',
    "subtitle_font_size" INTEGER NOT NULL DEFAULT 16,
    "subtitle_color" TEXT NOT NULL DEFAULT '#FFFFFF',
    "subtitle_bg_opacity" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "subtitle_offset" INTEGER NOT NULL DEFAULT 0,
    "theme_id" TEXT,
    "auto_skip_intro" BOOLEAN NOT NULL DEFAULT false,
    "auto_skip_outro" BOOLEAN NOT NULL DEFAULT false,
    "auto_next_episode" BOOLEAN NOT NULL DEFAULT true,
    "default_quality" TEXT NOT NULL DEFAULT 'auto',
    "default_playback_speed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "enable_notifications" BOOLEAN NOT NULL DEFAULT true,
    "enable_desktop_notifications" BOOLEAN NOT NULL DEFAULT true,
    "privacy_profile" "Privacy" NOT NULL DEFAULT 'PUBLIC',
    "privacy_watchlist" "Privacy" NOT NULL DEFAULT 'FRIENDS',
    "privacy_activity" "Privacy" NOT NULL DEFAULT 'FRIENDS',
    "show_adult_content" BOOLEAN NOT NULL DEFAULT false,
    "data_analytics" BOOLEAN NOT NULL DEFAULT true,
    "sync_enabled" BOOLEAN NOT NULL DEFAULT true,
    "auto_download" BOOLEAN NOT NULL DEFAULT false,
    "preferred_providers" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_media" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "anime_id" TEXT,
    "file_path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "file_hash" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "duration" INTEGER,
    "resolution" TEXT,
    "codec" TEXT,
    "bitrate" INTEGER,
    "audio_tracks" JSONB,
    "subtitle_tracks" JSONB,
    "thumbnail_path" TEXT,
    "is_indexed" BOOLEAN NOT NULL DEFAULT false,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtitle_files" (
    "id" TEXT NOT NULL,
    "episode_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subtitle_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" "SyncAction" NOT NULL,
    "payload" JSONB NOT NULL,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3),

    CONSTRAINT "sync_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover_image" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_items" (
    "id" TEXT NOT NULL,
    "collection_id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "notes" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "cover_image" TEXT,
    "author_id" TEXT,
    "category" "NewsCategory" NOT NULL DEFAULT 'ANNOUNCEMENT',
    "tags" TEXT[],
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "session_id" TEXT,
    "event_type" TEXT NOT NULL,
    "event_data" JSONB NOT NULL,
    "device_info" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_anonymized" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_last_active_at_idx" ON "users"("last_active_at");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_key" ON "sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_refresh_token_idx" ON "sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "devices_user_id_idx" ON "devices"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "anime_anilist_id_key" ON "anime"("anilist_id");

-- CreateIndex
CREATE UNIQUE INDEX "anime_mal_id_key" ON "anime"("mal_id");

-- CreateIndex
CREATE UNIQUE INDEX "anime_slug_key" ON "anime"("slug");

-- CreateIndex
CREATE INDEX "anime_slug_idx" ON "anime"("slug");

-- CreateIndex
CREATE INDEX "anime_status_idx" ON "anime"("status");

-- CreateIndex
CREATE INDEX "anime_format_idx" ON "anime"("format");

-- CreateIndex
CREATE INDEX "anime_season_season_year_idx" ON "anime"("season", "season_year");

-- CreateIndex
CREATE INDEX "anime_popularity_idx" ON "anime"("popularity");

-- CreateIndex
CREATE INDEX "anime_avg_score_idx" ON "anime"("avg_score");

-- CreateIndex
CREATE INDEX "anime_is_adult_idx" ON "anime"("is_adult");

-- CreateIndex
CREATE INDEX "anime_is_simulcast_idx" ON "anime"("is_simulcast");

-- CreateIndex
CREATE INDEX "anime_next_airing_at_idx" ON "anime"("next_airing_at");

-- CreateIndex
CREATE INDEX "anime_source_idx" ON "anime"("source");

-- CreateIndex
CREATE INDEX "anime_title_title_en_title_jp_title_romanji_synopsis_idx" ON "anime"("title", "title_en", "title_jp", "title_romanji", "synopsis");

-- CreateIndex
CREATE INDEX "episodes_anime_id_idx" ON "episodes"("anime_id");

-- CreateIndex
CREATE INDEX "episodes_anime_id_number_idx" ON "episodes"("anime_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "episodes_anime_id_number_key" ON "episodes"("anime_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");

-- CreateIndex
CREATE UNIQUE INDEX "studios_anilist_id_key" ON "studios"("anilist_id");

-- CreateIndex
CREATE UNIQUE INDEX "characters_anilist_id_key" ON "characters"("anilist_id");

-- CreateIndex
CREATE INDEX "characters_anime_id_idx" ON "characters"("anime_id");

-- CreateIndex
CREATE INDEX "characters_role_idx" ON "characters"("role");

-- CreateIndex
CREATE UNIQUE INDEX "anime_relations_anime_id_related_anime_id_key" ON "anime_relations"("anime_id", "related_anime_id");

-- CreateIndex
CREATE INDEX "anime_staff_anime_id_idx" ON "anime_staff"("anime_id");

-- CreateIndex
CREATE INDEX "watchlists_anime_id_idx" ON "watchlists"("anime_id");

-- CreateIndex
CREATE INDEX "watchlists_user_id_status_idx" ON "watchlists"("user_id", "status");

-- CreateIndex
CREATE INDEX "watchlists_user_id_is_favorite_idx" ON "watchlists"("user_id", "is_favorite");

-- CreateIndex
CREATE INDEX "watchlists_user_id_anime_id_idx" ON "watchlists"("user_id", "anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "watchlists_user_id_anime_id_key" ON "watchlists"("user_id", "anime_id");

-- CreateIndex
CREATE INDEX "watch_history_user_id_anime_id_idx" ON "watch_history"("user_id", "anime_id");

-- CreateIndex
CREATE INDEX "watch_history_user_id_watched_at_idx" ON "watch_history"("user_id", "watched_at");

-- CreateIndex
CREATE INDEX "watch_history_user_id_completed_idx" ON "watch_history"("user_id", "completed");

-- CreateIndex
CREATE INDEX "watch_history_episode_id_idx" ON "watch_history"("episode_id");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_user_id_anime_id_key" ON "ratings"("user_id", "anime_id");

-- CreateIndex
CREATE INDEX "reviews_anime_id_created_at_idx" ON "reviews"("anime_id", "created_at");

-- CreateIndex
CREATE INDEX "review_likes_review_id_idx" ON "review_likes"("review_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_likes_review_id_user_id_key" ON "review_likes"("review_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "follows_follower_id_following_id_key" ON "follows"("follower_id", "following_id");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_sender_id_receiver_id_key" ON "friendships"("sender_id", "receiver_id");

-- CreateIndex
CREATE INDEX "activities_user_id_created_at_idx" ON "activities"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "activities_target_type_target_id_idx" ON "activities"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "comments_target_type_target_id_created_at_idx" ON "comments"("target_type", "target_id", "created_at");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "comments_parent_id_idx" ON "comments"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_user_id_comment_id_target_type_target_id_emoji_key" ON "reactions"("user_id", "comment_id", "target_type", "target_id", "emoji");

-- CreateIndex
CREATE INDEX "watch_parties_host_id_status_idx" ON "watch_parties"("host_id", "status");

-- CreateIndex
CREATE INDEX "watch_parties_anime_id_idx" ON "watch_parties"("anime_id");

-- CreateIndex
CREATE INDEX "watch_party_participants_party_id_idx" ON "watch_party_participants"("party_id");

-- CreateIndex
CREATE UNIQUE INDEX "watch_party_participants_party_id_user_id_key" ON "watch_party_participants"("party_id", "user_id");

-- CreateIndex
CREATE INDEX "watch_party_messages_party_id_created_at_idx" ON "watch_party_messages"("party_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_user_id_type_created_at_idx" ON "notifications"("user_id", "type", "created_at");

-- CreateIndex
CREATE INDEX "downloads_user_id_status_idx" ON "downloads"("user_id", "status");

-- CreateIndex
CREATE INDEX "downloads_anime_id_idx" ON "downloads"("anime_id");

-- CreateIndex
CREATE INDEX "download_items_episode_id_idx" ON "download_items"("episode_id");

-- CreateIndex
CREATE INDEX "plugins_is_enabled_idx" ON "plugins"("is_enabled");

-- CreateIndex
CREATE INDEX "themes_user_id_is_active_idx" ON "themes"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "recommendations_user_id_score_idx" ON "recommendations"("user_id", "score");

-- CreateIndex
CREATE UNIQUE INDEX "recommendations_user_id_anime_id_key" ON "recommendations"("user_id", "anime_id");

-- CreateIndex
CREATE INDEX "search_queries_user_id_created_at_idx" ON "search_queries"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "search_queries_query_idx" ON "search_queries"("query");

-- CreateIndex
CREATE INDEX "search_documents_tokens_idx" ON "search_documents"("tokens");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- CreateIndex
CREATE INDEX "local_media_user_id_file_hash_idx" ON "local_media"("user_id", "file_hash");

-- CreateIndex
CREATE INDEX "local_media_file_hash_idx" ON "local_media"("file_hash");

-- CreateIndex
CREATE INDEX "local_media_user_id_anime_id_idx" ON "local_media"("user_id", "anime_id");

-- CreateIndex
CREATE INDEX "subtitle_files_episode_id_language_idx" ON "subtitle_files"("episode_id", "language");

-- CreateIndex
CREATE INDEX "sync_events_user_id_synced_created_at_idx" ON "sync_events"("user_id", "synced", "created_at");

-- CreateIndex
CREATE INDEX "collections_user_id_sort_order_idx" ON "collections"("user_id", "sort_order");

-- CreateIndex
CREATE INDEX "collections_user_id_is_public_idx" ON "collections"("user_id", "is_public");

-- CreateIndex
CREATE INDEX "collection_items_collection_id_idx" ON "collection_items"("collection_id");

-- CreateIndex
CREATE UNIQUE INDEX "collection_items_collection_id_anime_id_key" ON "collection_items"("collection_id", "anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "news_slug_key" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_slug_idx" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_category_published_at_idx" ON "news"("category", "published_at");

-- CreateIndex
CREATE INDEX "news_is_published_published_at_idx" ON "news"("is_published", "published_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "analytics_events_event_type_timestamp_idx" ON "analytics_events"("event_type", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_user_id_timestamp_idx" ON "analytics_events"("user_id", "timestamp");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_genres" ADD CONSTRAINT "anime_genres_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_genres" ADD CONSTRAINT "anime_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_studios" ADD CONSTRAINT "anime_studios_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_studios" ADD CONSTRAINT "anime_studios_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_relations" ADD CONSTRAINT "anime_relations_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_relations" ADD CONSTRAINT "anime_relations_related_anime_id_fkey" FOREIGN KEY ("related_anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_staff" ADD CONSTRAINT "anime_staff_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_likes" ADD CONSTRAINT "review_likes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_likes" ADD CONSTRAINT "review_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_parties" ADD CONSTRAINT "watch_parties_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_party_participants" ADD CONSTRAINT "watch_party_participants_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "watch_parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_party_participants" ADD CONSTRAINT "watch_party_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_party_messages" ADD CONSTRAINT "watch_party_messages_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "watch_parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_party_messages" ADD CONSTRAINT "watch_party_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "download_items" ADD CONSTRAINT "download_items_download_id_fkey" FOREIGN KEY ("download_id") REFERENCES "downloads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "download_items" ADD CONSTRAINT "download_items_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugins" ADD CONSTRAINT "plugins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "themes" ADD CONSTRAINT "themes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_queries" ADD CONSTRAINT "search_queries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_documents" ADD CONSTRAINT "search_documents_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_media" ADD CONSTRAINT "local_media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_media" ADD CONSTRAINT "local_media_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtitle_files" ADD CONSTRAINT "subtitle_files_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_events" ADD CONSTRAINT "sync_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
