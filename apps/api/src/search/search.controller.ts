import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SearchDto, GetPopularSearchesDto } from './dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search anime, users, and more' })
  async search(@CurrentUser('sub') userId: string, @Query() dto: SearchDto) {
    const results = await this.searchService.search(userId, dto);
    
    // Track search query for analytics
    await this.searchService.trackSearchQuery(userId, dto.q, results.total, dto.type);
    
    return results;
  }

  @Get('suggestions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get search suggestions' })
  async getSuggestions(@CurrentUser('sub') userId: string, @Query('q') query: string) {
    return this.searchService.getSuggestions(userId, query);
  }

  @Get('popular')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get popular search terms' })
  async getPopularSearches(@CurrentUser('sub') userId: string, @Query() dto: GetPopularSearchesDto) {
    return this.searchService.getPopularSearches(userId, dto);
  }

  @Post('recent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent searches' })
  async getRecentSearches(@CurrentUser('sub') userId: string) {
    return this.searchService.getRecentSearches(userId);
  }

  @Post('recent/:query')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark search query as recent' })
  async addRecentSearch(@CurrentUser('sub') userId: string, @Param('query') query: string) {
    return this.searchService.addRecentSearch(userId, query);
  }

  @Delete('recent/:query')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove search query from recent' })
  async removeRecentSearch(@CurrentUser('sub') userId: string, @Param('query') query: string) {
    await this.searchService.removeRecentSearch(userId, query);
    return { message: 'Search removed from recent' };
  }
}