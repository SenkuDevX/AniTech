import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Achievements')
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user achievements' })
  async getAchievements(@CurrentUser('sub') userId: string) {
    return this.achievementsService.getUserAchievements(userId);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all available achievements' })
  async getAll() {
    return this.achievementsService.getAll();
  }

  @Post(':id/earn')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Earn an achievement' })
  async earn(@CurrentUser('sub') userId: string, @Param('id') achievementId: string) {
    return this.achievementsService.earn(userId, achievementId);
  }
}