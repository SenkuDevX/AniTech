import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class PluginsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlugins(userId: string) {
    return this.prisma.plugin.findMany({
      where: { userId },
      orderBy: { installedAt: 'desc' },
    });
  }

  async discover(category?: string) {
    const where: any = {};
    if (category) where.permissions = { has: category };

    return this.prisma.plugin.findMany({
      where: { ...where, userId: null }, // Global plugins
      orderBy: { downloadCount: 'desc' },
      take: 50,
    });
  }

  async getById(id: string) {
    const plugin = await this.prisma.plugin.findUnique({ where: { id } });
    if (!plugin) throw new NotFoundException('Plugin not found');
    return plugin;
  }

  async install(userId: string, manifestUrl: string) {
    const existing = await this.prisma.plugin.findFirst({
      where: { userId, entryPoint: manifestUrl },
    });

    if (existing) throw new NotFoundException('Plugin already installed');

    return this.prisma.plugin.create({
      data: {
        userId,
        name: manifestUrl.split('/').pop() || 'Unknown Plugin',
        version: '1.0.0',
        author: 'unknown',
        entryPoint: manifestUrl,
        manifest: { url: manifestUrl },
        permissions: [],
      },
    });
  }

  async toggle(userId: string, pluginId: string) {
    const plugin = await this.prisma.plugin.findFirst({
      where: { id: pluginId, userId },
    });
    if (!plugin) throw new NotFoundException('Plugin not found');

    return this.prisma.plugin.update({
      where: { id: pluginId },
      data: { isEnabled: !plugin.isEnabled },
    });
  }

  async updateConfig(pluginId: string, config: any) {
    const plugin = await this.prisma.plugin.findUnique({ where: { id: pluginId } });
    if (!plugin) throw new NotFoundException('Plugin not found');

    return this.prisma.plugin.update({
      where: { id: pluginId },
      data: { config },
    });
  }

  async uninstall(userId: string, pluginId: string) {
    await this.prisma.plugin.deleteMany({
      where: { id: pluginId, userId },
    });
  }
}