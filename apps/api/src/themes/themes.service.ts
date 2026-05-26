import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ThemesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.theme.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActive(userId: string) {
    const theme = await this.prisma.theme.findFirst({
      where: { userId, isActive: true },
    });
    return theme || this.getDefault();
  }

  private async getDefault() {
    const theme = await this.prisma.theme.findFirst({
      where: { isDefault: true },
    });
    if (theme) return theme;
    
    // Create default dark theme if none exists
    return this.prisma.theme.create({
      data: {
        name: 'Midnight',
        colors: {
          surface: '#081425',
          'on-surface': '#d8e3fb',
          primary: '#bec6e0',
          tertiary: '#2fd9f4',
          background: '#081425',
        },
        isDefault: true,
      },
    });
  }

  async create(userId: string, dto: any) {
    return this.prisma.theme.create({
      data: {
        userId,
        name: dto.name || 'Custom Theme',
        colors: dto.colors,
        typography: dto.typography,
        spacing: dto.spacing,
        shapes: dto.shapes,
        isPublic: dto.isPublic || false,
        description: dto.description,
      },
    });
  }

  async activate(userId: string, themeId: string) {
    // Deactivate all themes
    await this.prisma.theme.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    // Activate selected theme
    const theme = await this.prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme) throw new NotFoundException('Theme not found');

    await this.prisma.theme.update({
      where: { id: themeId },
      data: { isActive: true },
    });

    return { activated: true, theme };
  }

  async update(themeId: string, dto: any) {
    return this.prisma.theme.update({
      where: { id: themeId },
      data: dto,
    });
  }

  async delete(themeId: string) {
    await this.prisma.theme.delete({ where: { id: themeId } });
  }
}