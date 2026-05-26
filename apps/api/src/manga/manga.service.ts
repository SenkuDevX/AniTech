import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class MangaService {
  constructor(private readonly prisma: PrismaService) {}

  async getChapter(chapterId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { pages: { orderBy: { page: 'asc' } } },
    });
    if (!chapter) throw new NotFoundException('Chapter not found');
    return chapter;
  }
}
