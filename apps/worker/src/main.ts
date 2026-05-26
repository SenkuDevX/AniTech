// Worker background jobs for AniTech

import { Queue, Worker, Job } from 'bullmq';
import { prisma } from '@anitech/database';

const connection = { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379') };

// Queue definitions
export const queues = {
  indexing: new Queue('indexing', { connection }),
  recommendations: new Queue('recommendations', { connection }),
  notifications: new Queue('notifications', { connection }),
  metadata: new Queue('metadata', { connection }),
  analytics: new Queue('analytics', { connection }),
  cleanup: new Queue('cleanup', { connection }),
};

async function main() {
  // Periodic job: every hour, sync anime metadata from providers
  new Worker('metadata', async (job: Job) => {
    switch (job.name) {
      case 'syncProvider': return syncProvider();
      case 'enrichMetadata': return enrichMetadata();
      case 'syncEpisodes': return syncEpisodes();
      case 'syncImages': return syncImages();
      default: throw new Error(`Unknown job: ${job.name}`);
    }
  }, { connection });

  // Every 10 minutes: update trending recommendations and cleanup stale data
  new Worker('recommendations', async () => {
    await updateTrendingScores();
  }, { connection });

  // Every hour: cleanup expired sessions and old data
  new Worker('cleanup', async () => {
    await cleanupExpiredData();
  }, { connection });

  // Analytics aggregation every 30 minutes
  new Worker('analytics', async () => {
    await aggregateAnalytics();
  }, { connection });

  console.log('Worker started. Listening for jobs...');
}

async function syncProvider() {
  // Sync all anime data from external providers
  // This queries the DB for sync events and processes them
  const syncEvents = await prisma.syncEvent.findMany({ where: { synced: false }, take: 50 });
  for (const event of syncEvents) {
    try {
      // Process sync event based on entity type and action
      // For now, just mark as synced
      await prisma.syncEvent.update({
        where: { id: event.id },
        data: { synced: true, syncedAt: new Date() },
      });
    } catch (error) {
      console.error(`Failed to process sync event ${event.id}:`, error);
    }
  }
  return { synced: syncEvents.length };
}

async function enrichMetadata() {
  // Enrich anime metadata: update scores, popularity, etc.
  // Pull latest data and update records
  const staleAnime = await prisma.anime.findMany({
    where: { lastSyncedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    take: 20,
    select: { id: true, title: true },
  });

  for (const anime of staleAnime) {
    // In production: fetch from external API (AniList, MAL) and update
    await prisma.anime.update({
      where: { id: anime.id },
      data: { lastSyncedAt: new Date() },
    });
  }
  return { enriched: staleAnime.length };
}

async function syncEpisodes() {
  // Sync episode data from streaming providers
  const activePlugins = await prisma.plugin.findMany({
    where: { isEnabled: true, permissions: { has: 'STREAMING_PROVIDER' } },
  });

  // For each active streaming plugin, sync episodes for releasing anime
  const releasingAnime = await prisma.anime.findMany({
    where: { status: 'RELEASING', nextAiringAt: { not: null } },
    take: 10,
    select: { id: true, title: true, slug: true, episodes: true, episodesAired: true, nextAiringAt: true },
  });

  for (const anime of releasingAnime) {
    // In production: query each plugin for new episodes
    // For now, just mark that they've been checked
    console.log(`Would sync episodes for: ${anime.title}`);
  }

  return { checked: releasingAnime.length, providers: activePlugins.length };
}

async function syncImages() {
  // Download and cache anime cover images, banners, etc.
  const animeWithoutImages = await prisma.anime.findMany({
    where: { OR: [{ coverImage: null }, { bannerImage: null }] },
    take: 20,
    select: { id: true, title: true, coverImage: true, bannerImage: true },
  });

  for (const anime of animeWithoutImages) {
    // In production: fetch images from external API and store
    console.log(`Would fetch images for: ${anime.title}`);
  }

  return { processed: animeWithoutImages.length };
}

async function updateTrendingScores() {
  // Recalculate trending scores based on watchlist additions and watch history
  const recentActivity = await prisma.watchHistory.groupBy({
    by: ['animeId'],
    _count: { id: true },
    where: { watchedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    orderBy: { _count: { id: 'desc' } },
    take: 100,
  });

  const watchlistAdds = await prisma.watchlist.groupBy({
    by: ['animeId'],
    _count: { id: true },
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    orderBy: { _count: { id: 'desc' } },
    take: 100,
  });

  // Update popularity scores based on activity
  for (const entry of recentActivity) {
    await prisma.anime.update({
      where: { id: entry.animeId },
      data: { popularity: { increment: 1 } },
    });
  }

  return { recentActivity: recentActivity.length, watchlistAdds: watchlistAdds.length };
}

async function cleanupExpiredData() {
  const now = new Date();

  // Delete expired sessions
  const expiredSessions = await prisma.session.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  // Delete old analytics events (older than 90 days)
  const oldEvents = await prisma.analyticsEvent.deleteMany({
    where: { timestamp: { lt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } },
  });

  // End stale watch parties
  const staleParties = await prisma.watchParty.updateMany({
    where: {
      status: 'ACTIVE',
      updatedAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    },
    data: { status: 'ENDED' },
  });

  return { deletedSessions: expiredSessions.count, deletedAnalytics: oldEvents.count, endedParties: staleParties.count };
}

async function aggregateAnalytics() {
  // Aggregate daily analytics
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [newUsers, activeUsers, newWatchlistEntries, episodesWatched] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: yesterday } } }),
    prisma.watchHistory.groupBy({ by: ['userId'], where: { watchedAt: { gte: yesterday } }, _count: { id: true } }),
    prisma.watchlist.count({ where: { createdAt: { gte: yesterday } } }),
    prisma.watchHistory.count({ where: { watchedAt: { gte: yesterday } } }),
  ]);

  console.log('Daily analytics:', { newUsers, activeUsers: activeUsers.length, newWatchlistEntries, episodesWatched });
  return { newUsers, activeUsers: activeUsers.length, newWatchlistEntries, episodesWatched };
}

// Start the worker
main().catch(console.error);

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
