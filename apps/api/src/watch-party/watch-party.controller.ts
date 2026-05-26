import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WatchPartyService } from './watch-party.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateWatchPartyDto } from './dto';

@ApiTags('WatchParty')
@Controller('watch-party')
export class WatchPartyController {
  constructor(private readonly watchPartyService: WatchPartyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a watch party' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateWatchPartyDto,
  ) {
    return this.watchPartyService.create(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active watch parties' })
  async list(@Query('page') page = 1, @Query('perPage') perPage = 20) {
    return this.watchPartyService.list(+page, +perPage);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my watch parties' })
  async getMyParties(@CurrentUser('sub') userId: string) {
    return this.watchPartyService.getMyParties(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get watch party details' })
  async getById(@Param('id') id: string) {
    return this.watchPartyService.getById(id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a watch party' })
  async join(@CurrentUser('sub') userId: string, @Param('id') partyId: string, @Body('password') password?: string) {
    return this.watchPartyService.join(userId, partyId, password);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave a watch party' })
  async leave(@CurrentUser('sub') userId: string, @Param('id') partyId: string) {
    await this.watchPartyService.leave(userId, partyId);
    return { message: 'Left watch party' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End a watch party' })
  async endParty(@CurrentUser('sub') userId: string, @Param('id') partyId: string) {
    await this.watchPartyService.endParty(userId, partyId);
    return { message: 'Watch party ended' };
  }
}