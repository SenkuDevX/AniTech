import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdatePlaybackDto } from './dto';

@Injectable()
export class PlayerService {
  constructor(private readonly prisma: PrismaService) {}

  async saveProgress(userId: string, dto: UpdatePlaybackDto) {
    const { animeId, episodeId, progress, duration, completed, playbackSpeed, quality, subtitleLang } = dto;

    const existing = await this.prisma.watchHistory.findFirst({
      where: { userId, animeId, episodeId },
    });

    const data: any = { progress, duration, playbackSpeed: playbackSpeed || 1.0, quality, subtitleLang };

    if (completed) {
      data.completed = true;
      data.progress = duration || progress;
    }

    if (existing) {
      await this.prisma.watchHistory.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await this.prisma.watchHistory.create({
        data: {
          userId,
          animeId,
          episodeId,
          progress,
          duration,
          watchSource: 'STREAMING',
          playbackSpeed: playbackSpeed || 1.0,
          quality,
          subtitleLang,
          completed: completed || false,
        },
      });
    }

    // Update watchlist status
    const watchlistEntry = await this.prisma.watchlist.findUnique({
      where: { userId_animeId: { userId, animeId } },
    });

    if (watchlistEntry && !completed) {
      const episode = await this.prisma.episode.findUnique({ where: { id: episodeId } });
      if (episode && episode.number > watchlistEntry.progress) {
        await this.prisma.watchlist.update({
          where: { id: watchlistEntry.id },
          data: {
            progress: episode.number,
            status: watchlistEntry.status === 'PLAN_TO_WATCH' ? 'WATCHING' : watchlistEntry.status,
          },
        });
      }
    }

    // Track activity
    if (completed) {
      await this.prisma.activity.create({
        data: {
          userId,
          type: 'WATCHED_EPISODE',
          targetType: 'episode',
          targetId: episodeId,
          content: { animeId, episodeId },
        },
      });
    }

    return { saved: true, progress, completed: completed || false };
  }

  async getProgress(userId: string, animeId: string, episodeId: string) {
    const progress = await this.prisma.watchHistory.findFirst({
      where: { userId, animeId, episodeId },
    });

    return progress || { progress: 0, completed: false };
  }

  async getHistory(userId: string, page: number, perPage: number) {
    const skip = (page - 1) * perPage;

    const [results, total] = await Promise.all([
      this.prisma.watchHistory.findMany({
        where: { userId },
        orderBy: { watchedAt: 'desc' },
        skip,
        take: perPage,
        include: {
          anime: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
              format: true,
            },
          },
          episode: {
            select: {
              id: true,
              number: true,
              title: true,
              thumbnail: true,
            },
          },
        },
      }),
      this.prisma.watchHistory.count({ where: { userId } }),
    ]);

    return { results, total, page, perPage };
  }

  async getAnimeHistory(userId: string, animeId: string) {
    return this.prisma.watchHistory.findMany({
      where: { userId, animeId },
      orderBy: { watchedAt: 'desc' },
      include: {
        episode: {
          select: {
            id: true,
            number: true,
            title: true,
            thumbnail: true,
            duration: true,
          },
        },
      },
    });
  }

  async getSources(animeId: string, episodeId: string, provider?: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id: episodeId },
      include: { anime: { select: { title: true } } },
    });

    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    // Query enabled streaming plugins for available sources
    const streamingPlugins = await this.prisma.plugin.findMany({
      where: { permissions: { has: 'STREAMING' }, isEnabled: true },
      select: { name: true, config: true },
    });

    const sources = streamingPlugins.map((plugin: any) => ({
      provider: plugin.name.toLowerCase(),
      type: 'hls',
      url: `${process.env.STREAM_API_URL || '/api/proxy/stream'}/anime/${animeId}/episode/${episodeId}.m3u8`,
      quality: ['1080p', '720p', '480p', '360p'],
      subtitles: [],
    }));

    // If no plugins found, use default source
    if (sources.length === 0) {
      sources.push({
        provider: 'default',
        type: 'hls',
        url: `${process.env.STREAM_API_URL || '/api/proxy/stream'}/anime/${animeId}/episode/${episodeId}.m3u8`,
        quality: ['1080p', '720p', '480p', '360p'],
        subtitles: [],
      });
    }

    return { episode: { id: episode.id, number: episode.number, title: episode.title }, sources };
  }

  async getSubtitles(episodeId: string) {
    return this.prisma.subtitleFile.findMany({
      where: { episodeId },
    });
  }
}