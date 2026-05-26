import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateCommentDto, AddReactionDto } from './dto';

@ApiTags('Social')
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get friend activity feed' })
  async getFeed(
    @CurrentUser('sub') userId: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
  ) {
    return this.socialService.getFeed(userId, +page, +perPage);
  }

  @Get('global')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get global activity feed' })
  async getGlobalFeed(
    @CurrentUser('sub') userId: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
  ) {
    return this.socialService.getGlobalFeed(+page, +perPage);
  }

  @Post('comment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a comment' })
  async postComment(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.socialService.postComment(userId, dto);
  }

  @Delete('comment/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment' })
  async deleteComment(@CurrentUser('sub') userId: string, @Param('id') commentId: string) {
    await this.socialService.deleteComment(userId, commentId);
  }

  @Get('comments/:targetType/:targetId')
  @ApiOperation({ summary: 'Get comments for target' })
  async getComments(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
  ) {
    return this.socialService.getComments(targetType, targetId, +page, +perPage);
  }

  @Post('reaction')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add/remove reaction' })
  async toggleReaction(
    @CurrentUser('sub') userId: string,
    @Body() dto: AddReactionDto,
  ) {
    return this.socialService.toggleReaction(userId, dto);
  }

  @Get('parties')
  @ApiOperation({ summary: 'Get active watch parties' })
  async getParties(@Query('page') page = 1, @Query('perPage') perPage = 10) {
    return this.socialService.getParties(+page, +perPage);
  }

  @Get('friends')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get friends list' })
  async getFriends(@CurrentUser('sub') userId: string) {
    return this.socialService.getFriends(userId);
  }

  @Get('activity')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get friend activity for right panel' })
  async getActivity(
    @CurrentUser('sub') userId: string,
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
  ) {
    return this.socialService.getActivity(userId, +page, +perPage);
  }

  @Get('online-friends')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get online friends' })
  async getOnlineFriends(@CurrentUser('sub') userId: string) {
    return this.socialService.getOnlineFriends(userId);
  }
}