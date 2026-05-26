import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(notifId: string, userId: string) {
    return this.prisma.notification.update({
      where: { id: notifId, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async create(data: {
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: any;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        body: data.body,
        data: data.data || {},
      },
    });
  }

  async notifyFriends(userId: string, type: string, title: string, body: string, notificationData?: any) {
    const friendIds = await this.getFriendIds(userId);
    
    const notifications = friendIds.map((friendId) => ({
      userId: friendId,
      type: type as any,
      title,
      body,
      data: notificationData || {},
    }));

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({ data: notifications });
    }
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