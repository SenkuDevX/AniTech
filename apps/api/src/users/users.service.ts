import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdateUserDto, UpdateProfileDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async exportData(userId: string) {
    const [user, watchlist, settings, activity, reviews] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true, username: true, displayName: true, email: true,
          avatarUrl: true, bannerUrl: true, bio: true, createdAt: true,
        },
      }),
      this.prisma.watchlist.findMany({
        where: { userId },
        include: {
          anime: { select: { id: true, title: true, slug: true } },
        },
      }),
      this.prisma.userSettings.findUnique({ where: { userId } }),
      this.prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      this.prisma.review.findMany({
        where: { userId },
        include: {
          anime: { select: { id: true, title: true } },
        },
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      user,
      watchlist,
      settings,
      activity,
      reviews,
    };
  }

  async importData(userId: string, data: any) {
    // Only import watchlist data from export
    if (data.watchlist && Array.isArray(data.watchlist)) {
      for (const entry of data.watchlist) {
        const anime = await this.prisma.anime.findUnique({ where: { slug: entry.anime?.slug || entry.animeId } });
        if (anime) {
          await this.prisma.watchlist.upsert({
            where: { userId_animeId: { userId, animeId: anime.id } },
            update: { status: entry.status, score: entry.score, notes: entry.notes },
            create: { userId, animeId: anime.id, status: entry.status || 'PLAN_TO_WATCH', score: entry.score, notes: entry.notes },
          });
        }
      }
    }
    return { imported: true, watchlistCount: data.watchlist?.length || 0 };
  }

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true,
        role: true,
        isGuest: true,
        createdAt: true,
        lastActiveAt: true,
        _count: {
          select: {
            watchlists: true,
            followsFollowing: true,
            followsFollowed: true,
            achievements: { where: { isCompleted: true } },
            friendshipsSent: { where: { status: 'ACCEPTED' } },
            friendshipsReceived: { where: { status: 'ACCEPTED' } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto | UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const allowedFields = [
      'displayName', 'avatarUrl', 'bannerUrl', 'bio', 'username', 'email', 'status',
    ] as const;
    const data: any = {};
    for (const field of allowedFields) {
      if ((dto as any)[field] !== undefined) {
        data[field] = (dto as any)[field];
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true,
        role: true,
      },
    });
  }

  async deleteProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { status: 'DEACTIVATED', deletedAt: new Date() },
    });

    return { message: 'User account deactivated' };
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ForbiddenException('Cannot follow yourself');
    }

    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    if (existing) {
      throw new ForbiddenException('Already following');
    }

    return this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async unfollow(followerId: string, followingId: string) {
    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    if (!existing) {
      throw new ForbiddenException('Not following this user');
    }

    await this.prisma.follow.delete({
      where: { id: existing.id },
    });

    return { message: 'User unfollowed' };
  }

  async getFollowing(id: string) {
    return this.prisma.follow.findMany({
      where: { followerId: id },
      select: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });
  }

  async getFollowers(id: string) {
    return this.prisma.follow.findMany({
      where: { followingId: id },
      select: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });
  }

  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new ForbiddenException('Cannot send friend request to yourself');
    }

    // Check if already friends
    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existingFriendship) {
      throw new ForbiddenException('Already friends or request pending');
    }

    return this.prisma.friendship.create({
      data: {
        senderId,
        receiverId,
        status: 'PENDING',
      },
    });
  }

  async acceptFriendRequest(userId: string, requestId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (!friendship || friendship.receiverId !== userId) {
      throw new ForbiddenException('Friendship request not found or not for this user');
    }

    await this.prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    });

    return { message: 'Friend request accepted' };
  }

  async rejectFriendRequest(userId: string, requestId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (!friendship || friendship.receiverId !== userId) {
      throw new ForbiddenException('Friendship request not found or not for this user');
    }

    await this.prisma.friendship.delete({
      where: { id: requestId },
    });

    return { message: 'Friend request rejected' };
  }

  async getFriends(id: string) {
    return this.prisma.friendship.findMany({
      where: {
        OR: [{ senderId: id, status: 'ACCEPTED' }, { receiverId: id, status: 'ACCEPTED' }],
      },
      select: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}