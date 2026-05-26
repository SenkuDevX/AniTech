import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateDownloadDto } from './dto';

@Injectable()
export class DownloadsService {
  constructor(private readonly prisma: PrismaService) {}

  async getQueue(userId: string) {
    return this.prisma.download.findMany({
      where: { userId },
      orderBy: { priority: 'asc' },
      include: {
        anime: { select: { id: true, title: true, slug: true, coverImage: true } },
        items: true,
      },
    });
  }

  async add(userId: string, dto: CreateDownloadDto) {
    return this.prisma.download.create({
      data: {
        userId,
        animeId: dto.animeId,
        sourceUrl: dto.source || `${process.env.STREAM_API_URL || '/api/proxy/stream'}/anime/${dto.animeId}/episode/${dto.episodeId}`,
        quality: dto.quality || 'HD',
        status: 'QUEUED',
      },
    });
  }

  async pause(downloadId: string) {
    return this.prisma.download.update({
      where: { id: downloadId },
      data: { status: 'PAUSED' },
    });
  }

  async resume(downloadId: string) {
    return this.prisma.download.update({
      where: { id: downloadId },
      data: { status: 'DOWNLOADING' },
    });
  }

  async cancel(downloadId: string) {
    await this.prisma.downloadItem.deleteMany({ where: { downloadId } });
    await this.prisma.download.delete({ where: { id: downloadId } });
  }
}