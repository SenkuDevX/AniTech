import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class WatchPartyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: { animeId: string; episodeId: string; name: string; description?: string; isPrivate?: boolean; password?: string; maxUsers?: number },
  ) {
    const party = await this.prisma.watchParty.create({
      data: {
        hostId: userId,
        animeId: dto.animeId,
        episodeId: dto.episodeId,
        name: dto.name,
        description: dto.description,
        isPrivate: dto.isPrivate || false,
        password: dto.password,
        maxUsers: dto.maxUsers || 50,
      },
      include: {
        host: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        participants: {
          include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
        },
      },
    });

    // Add host as participant
    await this.prisma.watchPartyParticipant.create({
      data: { partyId: party.id, userId, role: 'HOST' },
    });

    // Track activity
    await this.prisma.activity.create({
      data: {
        userId,
        type: 'CREATED_WATCH_PARTY',
        targetType: 'watch_party',
        targetId: party.id,
        content: { name: dto.name },
      },
    });

    return party;
  }

  async list(page: number, perPage: number) {
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

  async getMyParties(userId: string) {
    return this.prisma.watchPartyParticipant.findMany({
      where: { userId },
      include: {
        party: {
          include: {
            host: { select: { id: true, username: true, displayName: true } },
            _count: { select: { participants: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async getById(id: string) {
    const party = await this.prisma.watchParty.findUnique({
      where: { id },
      include: {
        host: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        participants: {
          include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
          include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
        },
      },
    });

    if (!party) throw new NotFoundException('Watch party not found');
    return party;
  }

  async join(userId: string, partyId: string, password?: string) {
    const party = await this.prisma.watchParty.findUnique({ where: { id: partyId } });
    if (!party) throw new NotFoundException('Watch party not found');
    if (party.status !== 'ACTIVE') throw new ForbiddenException('Watch party is not active');
    if (party.password && party.password !== password) throw new ForbiddenException('Invalid password');

    const participantCount = await this.prisma.watchPartyParticipant.count({ where: { partyId } });
    if (participantCount >= party.maxUsers) throw new ForbiddenException('Watch party is full');

    const existing = await this.prisma.watchPartyParticipant.findFirst({
      where: { partyId, userId },
    });
    if (existing) throw new ForbiddenException('Already in party');

    await this.prisma.watchPartyParticipant.create({
      data: { partyId, userId },
    });

    return { message: 'Joined watch party' };
  }

  async leave(userId: string, partyId: string) {
    await this.prisma.watchPartyParticipant.deleteMany({
      where: { partyId, userId },
    });
  }

  async endParty(userId: string, partyId: string) {
    const party = await this.prisma.watchParty.findUnique({ where: { id: partyId } });

    if (!party) throw new NotFoundException('Watch party not found');
    if (party.hostId !== userId) throw new ForbiddenException('Only host can end the party');

    await this.prisma.watchParty.update({
      where: { id: partyId },
      data: { status: 'ENDED', endedAt: new Date() },
    });

    return { message: 'Watch party ended' };
  }
}