import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LocalMediaService } from './local-media.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ScanMediaDto, MatchMediaDto } from './dto';

@ApiTags('LocalMedia')
@Controller('local-media')
export class LocalMediaController {
  constructor(private readonly localMediaService: LocalMediaService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get local media library' })
  async getLibrary(@CurrentUser('sub') userId: string) {
    return this.localMediaService.getLibrary(userId);
  }

  @Post('scan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Scan local media directories' })
  async scan(@CurrentUser('sub') userId: string, @Body() dto: ScanMediaDto) {
    return this.localMediaService.scan(userId, dto.paths);
  }

  @Post('match')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Match local media to anime' })
  async match(@CurrentUser('sub') userId: string, @Body() dto: MatchMediaDto) {
    return this.localMediaService.match(userId, dto.mediaId, dto.animeId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove local media from library' })
  async remove(@CurrentUser('sub') userId: string, @Param('id') mediaId: string) {
    await this.localMediaService.remove(userId, mediaId);
  }
}