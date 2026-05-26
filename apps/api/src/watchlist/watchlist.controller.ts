import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WatchlistService } from './watchlist.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AddToWatchlistDto, UpdateWatchlistEntryDto } from './dto';

@ApiTags('Watchlist')
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user watchlist' })
  async getWatchlist(
    @CurrentUser('sub') userId: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
  ) {
    return this.watchlistService.getWatchlist(userId, { status, sort, page: +page, perPage: +perPage });
  }

  @Get('continue-watching')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get continue watching items' })
  async getContinueWatching(@CurrentUser('sub') userId: string) {
    return this.watchlistService.getContinueWatching(userId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get watchlist statistics' })
  async getStats(@CurrentUser('sub') userId: string) {
    return this.watchlistService.getStats(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add anime to watchlist' })
  async add(@CurrentUser('sub') userId: string, @Body() dto: AddToWatchlistDto) {
    return this.watchlistService.add(userId, dto);
  }

  @Patch(':animeId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update watchlist entry' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('animeId') animeId: string,
    @Body() dto: UpdateWatchlistEntryDto,
  ) {
    return this.watchlistService.update(userId, animeId, dto);
  }

  @Delete(':animeId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove anime from watchlist' })
  async remove(@CurrentUser('sub') userId: string, @Param('animeId') animeId: string) {
    await this.watchlistService.remove(userId, animeId);
  }

  @Post(':animeId/rating')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rate an anime' })
  async rate(
    @CurrentUser('sub') userId: string,
    @Param('animeId') animeId: string,
    @Body('score') score: number,
  ) {
    return this.watchlistService.rate(userId, animeId, score);
  }

  @Post(':animeId/review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Write a review' })
  async review(
    @CurrentUser('sub') userId: string,
    @Param('animeId') animeId: string,
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('score') score: number,
    @Body('isSpoiler') isSpoiler = false,
  ) {
    return this.watchlistService.review(userId, animeId, { title, content, score, isSpoiler });
  }
}