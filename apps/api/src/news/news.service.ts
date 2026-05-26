import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: { category?: any; limit: number; page: number }) {
    const where: any = { isPublished: true };
    if (filters.category) where.category = filters.category;

    const skip = (filters.page - 1) * filters.limit;

    const [results, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        skip,
        take: filters.limit,
        include: {
          author: {
            select: { id: true, username: true, displayName: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.news.count({ where }),
    ]);

    return { results, total, page: filters.page, perPage: filters.limit };
  }

  async getBySlug(slug: string) {
    const news = await this.prisma.news.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    });

    if (!news) throw new NotFoundException('News article not found');
    return news;
  }

  async getTrending(limit = 5) {
    return this.prisma.news.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' }, // In a real system, would be based on views
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        publishedAt: true,
        category: true,
      },
    });
  }
}
