import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnimeService } from './anime.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Anime')
@Controller({
  version: '1',
  path: 'anime',
})
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Get()
  @ApiOperation({ summary: 'List anime with filters' })
  async list(
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
    @Query('status') status?: string,
    @Query('format') format?: string,
    @Query('season') season?: string,
    @Query('year') year?: number,
    @Query('genre') genre?: string,
    @Query('sort') sort?: string,
  ) {
    return this.animeService.list({ page, perPage, status, format, season, year, genre, sort });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured anime for hero section' })
  async getFeatured(@Query('limit') limit = 10) {
    return this.animeService.getFeatured(+limit);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending anime' })
  async getTrending(@Query('limit') limit = 20) {
    return this.animeService.getTrending(+limit);
  }

  @Get('seasonal')
  @ApiOperation({ summary: 'Get current seasonal anime' })
  async getSeasonal(@Query('limit') limit = 30) {
    return this.animeService.getSeasonal(+limit);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get most popular anime' })
  async getPopular(@Query('limit') limit = 20, @Query('page') page = 1) {
    return this.animeService.getPopular(+limit, +page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get anime details' })
  async getById(@Param('id') id: string) {
    return this.animeService.getById(id);
  }

  @Get(':id/episodes')
  @ApiOperation({ summary: 'Get episodes for anime' })
  async getEpisodes(@Param('id') id: string) {
    return this.animeService.getEpisodes(id);
  }

  @Get(':id/episodes/:episodeId')
  @ApiOperation({ summary: 'Get single episode details' })
  async getEpisode(@Param('id') animeId: string, @Param('episodeId') episodeId: string) {
    return this.animeService.getEpisode(animeId, episodeId);
  }

  @Get(':id/characters')
  @ApiOperation({ summary: 'Get characters for anime' })
  async getCharacters(@Param('id') id: string) {
    return this.animeService.getCharacters(id);
  }

  @Get(':id/relations')
  @ApiOperation({ summary: 'Get related anime' })
  async getRelations(@Param('id') id: string) {
    return this.animeService.getRelations(id);
  }

  @Get(':id/staff')
  @ApiOperation({ summary: 'Get staff for anime' })
  async getStaff(@Param('id') id: string) {
    return this.animeService.getStaff(id);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get reviews for anime' })
  async getReviews(@Param('id') id: string, @Query('page') page = 1) {
    return this.animeService.getReviews(id, +page);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like an anime' })
  async toggleLike(@CurrentUser('sub') userId: string, @Param('id') animeId: string) {
    return this.animeService.toggleLike(userId, animeId);
  }
}