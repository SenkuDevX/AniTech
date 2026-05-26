import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PluginsService } from './plugins.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InstallPluginDto, ConfigurePluginDto } from './dto';

@ApiTags('Plugins')
@Controller('plugins')
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get installed plugins' })
  async getPlugins(@CurrentUser('sub') userId: string) {
    return this.pluginsService.getPlugins(userId);
  }

  @Get('discover')
  @ApiOperation({ summary: 'Browse available plugins' })
  async discover(@Query('category') category?: string) {
    return this.pluginsService.discover(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plugin details' })
  async getById(@Param('id') id: string) {
    return this.pluginsService.getById(id);
  }

  @Post('install')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Install a plugin' })
  async install(@CurrentUser('sub') userId: string, @Body() dto: InstallPluginDto) {
    return this.pluginsService.install(userId, dto.source);
  }

  @Post(':id/toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable/disable a plugin' })
  async toggle(@CurrentUser('sub') userId: string, @Param('id') pluginId: string) {
    return this.pluginsService.toggle(userId, pluginId);
  }

  @Patch(':id/config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update plugin configuration' })
  async updateConfig(@CurrentUser('sub') userId: string, @Param('id') pluginId: string, @Body() dto: ConfigurePluginDto) {
    return this.pluginsService.updateConfig(pluginId, dto.config);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Uninstall a plugin' })
  async uninstall(@CurrentUser('sub') userId: string, @Param('id') pluginId: string) {
    await this.pluginsService.uninstall(userId, pluginId);
  }
}