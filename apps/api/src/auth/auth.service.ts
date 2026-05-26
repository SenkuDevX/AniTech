import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../common/prisma.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ChangePasswordDto,
  CreateGuestDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        displayName: dto.displayName || dto.username,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);
    
    // Create default settings
    await this.prisma.userSettings.create({
      data: { userId: user.id },
    });

    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create device entry if device info is provided
    let deviceId: string | undefined;
    if (dto.deviceInfo) {
      const device = await this.prisma.device.create({
        data: {
          userId: user.id,
          name: dto.deviceInfo.name,
          type: dto.deviceInfo.type,
          os: dto.deviceInfo.os,
          osVersion: dto.deviceInfo.osVersion,
          appVersion: dto.deviceInfo.appVersion,
        },
      });
      deviceId = device.id;
    }

    const tokens = await this.generateTokens(user.id, user.email, deviceId);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async createGuest(dto: CreateGuestDto) {
    const username = `guest_${uuidv4().slice(0, 8)}`;
    
    const user = await this.prisma.user.create({
      data: {
        email: `${username}@guest.anitech`,
        username,
        displayName: dto.displayName || 'Guest',
        isGuest: true,
        passwordHash: await argon2.hash(uuidv4()),
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        isGuest: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    return { user, ...tokens };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const session = await this.prisma.session.findUnique({
        where: { refreshToken: dto.refreshToken },
        include: { user: true },
      });

      if (!session || new Date() > session.expiresAt) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Revoke old session
      await this.prisma.session.delete({
        where: { id: session.id },
      });

      const tokens = await this.generateTokens(session.user.id, session.user.email, session.deviceId ?? undefined);

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.session.deleteMany({
        where: { refreshToken, userId },
      });
      return;
    }

    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async logoutAllDevices(userId: string) {
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    await this.prisma.device.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newPasswordHash = await argon2.hash(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all sessions except current
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    return { message: 'Password changed successfully' };
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
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
          },
        },
      },
    });
  }

  async getActiveSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        device: {
          select: {
            name: true,
            type: true,
            os: true,
            lastUsedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new ForbiddenException('Session not found');
    }

    await this.prisma.session.delete({
      where: { id: sessionId },
    });

    return { message: 'Session revoked successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Don't reveal whether the email exists
    if (!user || user.isGuest) {
      return { message: 'If that email is registered, you will receive a password reset link' };
    }

    const token = uuidv4();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // In production, send email with reset link
    return { message: 'If that email is registered, you will receive a password reset link', token };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    if (resetToken.usedAt) {
      throw new BadRequestException('Reset token has already been used');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Reset token has expired');
    }

    const newPasswordHash = await argon2.hash(dto.newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: newPasswordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.session.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    return { message: 'Password has been reset successfully' };
  }

  private async generateTokens(userId: string, email: string, deviceId?: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    });

    // Store session
    await this.prisma.session.create({
      data: {
        userId,
        deviceId,
        token: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { accessToken, refreshToken };
  }
}
