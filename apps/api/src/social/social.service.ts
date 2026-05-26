import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(userId: string, page: number, perPage: number) {
    const skip = (page - 1) * perPage;

    const [results, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: {
          OR: [
            { userId },
            { userId: { in: (await this.getFriendIds(userId)) } },
          ],
          isPrivate: false,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.activity.count({
        where: {
          OR: [
            { userId },
            { userId: { in: await this.getFriendIds(userId) } },
          ],
          isPrivate: false,
        },
      }),
    ]);

    return { results, total, page, perPage };
  }

  async getGlobalFeed(page: number, perPage: number) {
    const skip = (page - 1) * perPage;

    const [results, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: { isPrivate: false },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.activity.count({ where: { isPrivate: false } }),
    ]);

    return { results, total, page, perPage };
  }

  async postComment(
    userId: string,
    data: { targetType: string; targetId: string; content: string; parentId?: string; isSpoiler?: boolean },
  ) {
    return this.prisma.comment.create({
      data: {
        userId,
        targetType: data.targetType,
        targetId: data.targetId,
        content: data.content,
        parentId: data.parentId,
        isSpoiler: data.isSpoiler || false,
      },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.userId !== userId) return;

    await this.prisma.comment.deleteMany({
      where: { OR: [{ id: commentId }, { parentId: commentId }] },
    });
  }

  async getComments(targetType: string, targetId: string, page: number, perPage: number) {
    const skip = (page - 1) * perPage;

    const [results, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { targetType, targetId, parentId: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
        include: {
          user: {
            select: { id: true, username: true, displayName: true, avatarUrl: true },
          },
          reactions: {
            select: { emoji: true, userId: true },
          },
          _count: { select: { replies: true, reactions: true } },
        },
      }),
      this.prisma.comment.count({ where: { targetType, targetId, parentId: null } }),
    ]);

    return { results, total, page, perPage };
  }

  async toggleReaction(
    userId: string,
    data: { commentId?: string; targetType?: string; targetId?: string; emoji: string },
  ) {
    const existing = await this.prisma.reaction.findFirst({
      where: {
        userId,
        ...(data.commentId ? { commentId: data.commentId } : { targetType: data.targetType, targetId: data.targetId }),
        emoji: data.emoji,
      },
    });

    if (existing) {
      await this.prisma.reaction.delete({ where: { id: existing.id } });
      return { reacted: false };
    }

    await this.prisma.reaction.create({
      data: {
        userId,
        commentId: data.commentId,
        targetType: data.targetType,
        targetId: data.targetId,
        emoji: data.emoji,
      },
    });

    return { reacted: true };
  }

  async getParties(page = 1, perPage = 10) {
    const skip = (page - 1) * perPage;
    const [results, total] = await Promise.all([
      this.prisma.watchParty.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
        include: {
          host: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          _count: { select: { participants: true } },
        },
      }),
      this.prisma.watchParty.count({ where: { status: 'ACTIVE' } }),
    ]);
    return { results, total, page, perPage };
  }

  async getActivity(userId: string, page = 1, perPage = 20) {
    return this.getFeed(userId, page, perPage);
  }

  async getFriends(userId: string) {
    const friendIds = await this.getFriendIds(userId);
    return this.prisma.user.findMany({
      where: { id: { in: friendIds } },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        lastActiveAt: true,
        status: true,
      },
    });
  }

  async getOnlineFriends(userId: string) {
    const friendIds = await this.getFriendIds(userId);

    return this.prisma.user.findMany({
      where: {
        id: { in: friendIds },
        lastActiveAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        lastActiveAt: true,
        _count: { select: { watchlists: { where: { status: 'WATCHING' } } } },
      },
    });
  }

  private async getFriendIds(userId: string): Promise<string[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: 'ACCEPTED',
      },
    });

    return friendships.map((f: any) => (f.senderId === userId ? f.receiverId : f.senderId));
  }
}