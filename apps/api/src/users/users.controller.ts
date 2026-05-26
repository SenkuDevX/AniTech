import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto, FollowUserDto } from './dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export user data' })
  async exportData(@CurrentUser('sub') userId: string) {
    return this.usersService.exportData(userId);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Import user data' })
  async importData(@CurrentUser('sub') userId: string, @Body() data: any) {
    return this.usersService.importData(userId, data);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser('sub') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@CurrentUser('sub') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  async getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile (admin only)' })
  async updateProfile(@CurrentUser('sub') adminId: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user account (admin only)' })
  async deleteProfile(@CurrentUser('sub') adminId: string, @Param('id') id: string) {
    await this.usersService.deleteProfile(id);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a user' })
  async follow(@CurrentUser('sub') followerId: string, @Param('id') followingId: string) {
    return this.usersService.follow(followerId, followingId);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow a user' })
  async unfollow(@CurrentUser('sub') followerId: string, @Param('id') followingId: string) {
    await this.usersService.unfollow(followerId, followingId);
  }

  @Get(':id/following')
  @ApiOperation({ summary: 'Get users followed by user' })
  async getFollowing(@Param('id') id: string) {
    return this.usersService.getFollowing(id);
  }

  @Get(':id/followers')
  @ApiOperation({ summary: 'Get users following user' })
  async getFollowers(@Param('id') id: string) {
    return this.usersService.getFollowers(id);
  }

  @Post(':id/friend-request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send friend request' })
  async sendFriendRequest(@CurrentUser('sub') senderId: string, @Param('id') receiverId: string) {
    return this.usersService.sendFriendRequest(senderId, receiverId);
  }

  @Post(':id/friend-request/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept friend request' })
  async acceptFriendRequest(@CurrentUser('sub') userId: string, @Param('id') requestId: string) {
    return this.usersService.acceptFriendRequest(userId, requestId);
  }

  @Delete(':id/friend-request/:requestId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject friend request' })
  async rejectFriendRequest(@CurrentUser('sub') userId: string, @Param('requestId') requestId: string) {
    await this.usersService.rejectFriendRequest(userId, requestId);
  }

  @Get(':id/friends')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user friends' })
  async getFriends(@Param('id') id: string) {
    return this.usersService.getFriends(id);
  }
}