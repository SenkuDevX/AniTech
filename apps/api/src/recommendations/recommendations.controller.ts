import { Controller, Get, Post, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('personalized')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personalized recommendations' })
  async getPersonalized(@CurrentUser('sub') userId: string, @Query('limit') limit = 12) {
    return this.recommendationsService.getPersonalized(userId, +limit);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending recommendations' })
  async getTrending(@Query('limit') limit = 12) {
    return this.recommendationsService.getTrending(+limit);
  }

  @Get('similar')
  @ApiOperation({ summary: 'Get similar anime recommendations' })
  async getSimilar(@Query('animeId') animeId: string, @Query('limit') limit = 6) {
    return this.recommendationsService.getSimilar(animeId, +limit);
  }

  @Get('users-who-watched')
  @ApiOperation({ summary: 'Users who watched X also watched Y' })
  async getUsersWhoWatched(@Query('animeId') animeId: string, @Query('limit') limit = 6) {
    return this.recommendationsService.getUsersWhoWatched(animeId, +limit);
  }

  @Get('hidden-gems')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get hidden gem recommendations' })
  async getHiddenGems(@CurrentUser('sub') userId: string, @Query('limit') limit = 6) {
    return this.recommendationsService.getHiddenGems(userId, +limit);
  }

  @Post(':id/dismiss')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dismiss a recommendation' })
  async dismiss(@CurrentUser('sub') userId: string, @Param('id') animeId: string) {
    return this.recommendationsService.dismiss(userId, animeId);
  }

  @Post(':id/click')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track recommendation click' })
  async trackClick(@CurrentUser('sub') userId: string, @Param('id') animeId: string) {
    return this.recommendationsService.trackClick(userId, animeId);
  }
}