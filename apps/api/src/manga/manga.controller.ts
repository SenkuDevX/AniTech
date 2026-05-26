import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MangaService } from './manga.service';

@ApiTags('Manga')
@Controller('manga')
export class MangaController {
  constructor(private readonly mangaService: MangaService) {}

  @Get('chapter/:id')
  @ApiOperation({ summary: 'Get chapter details and pages' })
  async getChapter(@Param('id') id: string) {
    return this.mangaService.getChapter(id);
  }
}
