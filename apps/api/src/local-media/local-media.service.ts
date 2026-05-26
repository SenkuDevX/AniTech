import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as crypto from 'crypto';
import * as fs from 'fs';

@Injectable()
export class LocalMediaService {
  constructor(private readonly prisma: PrismaService) {}

  async getLibrary(userId: string) {
    return this.prisma.localMedia.findMany({
      where: { userId },
      orderBy: { scannedAt: 'desc' },
      include: {
        anime: { select: { id: true, title: true, slug: true, coverImage: true } },
      },
    });
  }

  async scan(userId: string, paths: string[]) {
    const results = [];
    for (const filePath of paths) {
      const existing = await this.prisma.localMedia.findFirst({
        where: { userId, filePath },
      });
      if (existing) {
        results.push(existing);
        continue;
      }

      const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || 'Unknown';
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      const format = ['mkv', 'mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext) ? ext : 'unknown';

      let fileSize: bigint | undefined;
      try {
        const stats = fs.statSync(filePath);
        fileSize = BigInt(stats.size);
      } catch {
        // File might not be accessible (e.g. on server side when scanned from Tauri)
      }

      const media = await this.prisma.localMedia.create({
        data: {
          userId,
          filePath,
          fileName,
          fileSize: fileSize || BigInt(0),
          fileHash: crypto.createHash('md5').update(filePath).digest('hex'),
          format,
          isIndexed: false,
        },
      });
      results.push(media);
    }
    return { scanned: results.length, total: results };
  }

  async match(userId: string, mediaId: string, animeId: string) {
    return this.prisma.localMedia.update({
      where: { id: mediaId, userId },
      data: { animeId, isIndexed: true },
    });
  }

  async remove(userId: string, mediaId: string) {
    const media = await this.prisma.localMedia.findFirst({
      where: { id: mediaId, userId },
    });
    if (!media) throw new NotFoundException('Local media not found');

    await this.prisma.localMedia.delete({
      where: { id: mediaId },
    });
  }
}