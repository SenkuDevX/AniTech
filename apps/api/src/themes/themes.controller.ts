import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ThemesService } from './themes.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Themes')
@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get()
  @ApiOperation({ summary: 'List available themes' })
  async list() {
    return this.themesService.list();
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active theme for user' })
  async getActive(@CurrentUser('sub') userId: string) {
    return this.themesService.getActive(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a custom theme' })
  async create(@CurrentUser('sub') userId: string, @Body() dto: any) {
    return this.themesService.create(userId, dto);
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate a theme' })
  async activate(@CurrentUser('sub') userId: string, @Param('id') themeId: string) {
    return this.themesService.activate(userId, themeId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a custom theme' })
  async update(@CurrentUser('sub') userId: string, @Param('id') themeId: string, @Body() dto: any) {
    return this.themesService.update(themeId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a custom theme' })
  async delete(@CurrentUser('sub') userId: string, @Param('id') themeId: string) {
    await this.themesService.delete(themeId);
  }
}