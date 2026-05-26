import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NewsService } from './news.service';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'List published news articles' })
  async list(
    @Query('category') category?: string,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    return this.newsService.list({ category, limit: +limit, page: +page });
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending news' })
  async getTrending(@Query('limit') limit = 5) {
    return this.newsService.getTrending(+limit);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get news article by slug' })
  async getBySlug(@Param('slug') slug: string) {
    return this.newsService.getBySlug(slug);
  }
}
