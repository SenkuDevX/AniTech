import { Injectable } from '@nestjs/common';
import { prisma } from '../common/prisma.service';

@Injectable()
export class HealthService {
  async check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '0.1.0',
    };
  }

  async diagnostics() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.env.APP_VERSION || '0.1.0',
      node: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV || 'development',
      services: {
        api: 'online',
        database: await this.checkDatabase(),
        redis: process.env.REDIS_URL ? 'configured' : 'not configured',
        meilisearch: process.env.MEILISEARCH_HOST ? 'configured' : 'not configured',
      },
    };
  }

  private async checkDatabase(): Promise<string> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return 'connected';
    } catch {
      return 'disconnected';
    }
  }
}