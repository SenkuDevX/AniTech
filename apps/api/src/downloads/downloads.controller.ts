import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DownloadsService } from './downloads.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateDownloadDto } from './dto';

@ApiTags('Downloads')
@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get download queue' })
  async getQueue(@CurrentUser('sub') userId: string) {
    return this.downloadsService.getQueue(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add download to queue' })
  async add(@CurrentUser('sub') userId: string, @Body() dto: CreateDownloadDto) {
    return this.downloadsService.add(userId, dto);
  }

  @Patch(':id/pause')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pause a download' })
  async pause(@CurrentUser('sub') userId: string, @Param('id') downloadId: string) {
    return this.downloadsService.pause(downloadId);
  }

  @Patch(':id/resume')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resume a download' })
  async resume(@CurrentUser('sub') userId: string, @Param('id') downloadId: string) {
    return this.downloadsService.resume(downloadId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a download' })
  async cancel(@CurrentUser('sub') userId: string, @Param('id') downloadId: string) {
    await this.downloadsService.cancel(downloadId);
  }
}