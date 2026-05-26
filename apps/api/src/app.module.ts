import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AnimeModule } from './anime/anime.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { PlayerModule } from './player/player.module';
import { SearchModule } from './search/search.module';
import { SocialModule } from './social/social.module';
import { WatchPartyModule } from './watch-party/watch-party.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PluginsModule } from './plugins/plugins.module';
import { ThemesModule } from './themes/themes.module';
import { DownloadsModule } from './downloads/downloads.module';
import { LocalMediaModule } from './local-media/local-media.module';
import { SettingsModule } from './settings/settings.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { AchievementsModule } from './achievements/achievements.module';
import { NewsModule } from './news/news.module';
import { MangaModule } from './manga/manga.module';
import { ProxyModule } from './proxy/proxy.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './common/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env', '.env.local', '.env.production'],
    }),
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 10,
      },
      {
        name: 'long',
        ttl: 600000,
        limit: 100,
      },
    ]),
    AuthModule,
    UsersModule,
    AnimeModule,
    WatchlistModule,
    PlayerModule,
    SearchModule,
    SocialModule,
    WatchPartyModule,
    NotificationsModule,
    PluginsModule,
    ThemesModule,
    DownloadsModule,
    LocalMediaModule,
    SettingsModule,
    RecommendationsModule,
    AchievementsModule,
    NewsModule,
    MangaModule,
    ProxyModule,
    HealthModule,
  ],
})
export class AppModule {}
