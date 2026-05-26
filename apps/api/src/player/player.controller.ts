import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdatePlaybackDto } from './dto';

@ApiTags('Player')
@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post('progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save playback progress' })
  async saveProgress(@CurrentUser('sub') userId: string, @Body() dto: UpdatePlaybackDto) {
    return this.playerService.saveProgress(userId, dto);
  }

  @Get('progress/:animeId/:episodeId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get playback progress for episode' })
  async getProgress(
    @CurrentUser('sub') userId: string,
    @Param('animeId') animeId: string,
    @Param('episodeId') episodeId: string,
  ) {
    return this.playerService.getProgress(userId, animeId, episodeId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get watch history' })
  async getHistory(
    @CurrentUser('sub') userId: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
  ) {
    return this.playerService.getHistory(userId, +page, +perPage);
  }

  @Get('history/:animeId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get watch history for specific anime' })
  async getAnimeHistory(
    @CurrentUser('sub') userId: string,
    @Param('animeId') animeId: string,
  ) {
    return this.playerService.getAnimeHistory(userId, animeId);
  }

  @Get('sources/:animeId/:episodeId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get streaming sources for episode' })
  async getSources(
    @Param('animeId') animeId: string,
    @Param('episodeId') episodeId: string,
    @Query('provider') provider?: string,
  ) {
    return this.playerService.getSources(animeId, episodeId, provider);
  }

  @Get('subtitles/:episodeId')
  @ApiOperation({ summary: 'Get subtitles for episode' })
  async getSubtitles(@Param('episodeId') episodeId: string) {
    return this.playerService.getSubtitles(episodeId);
  }
}