import { IsString, IsOptional, IsEnum, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ActivityType {
  WATCHING = 'WATCHING',
  COMPLETED = 'COMPLETED',
  PLANNING = 'PLANNING',
  DROPPED = 'DROPPED',
  RATED = 'RATED',
  REVIEWED = 'REVIEWED',
  ACHIEVEMENT_EARNED = 'ACHIEVEMENT_EARNED',
  WATCH_PARTY = 'WATCH_PARTY',
  FRIEND_ADDED = 'FRIEND_ADDED',
}

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  targetType: string;

  @ApiProperty()
  @IsString()
  targetId: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class ActivityQueryDto {
  @ApiPropertyOptional({ enum: ActivityType })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  followingOnly?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;
}

export class CreateFriendRequestDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}

export class HandleFriendRequestDto {
  @ApiProperty()
  @IsBoolean()
  accept: boolean;
}

export class AddReactionDto {
  @ApiProperty()
  @IsString()
  emoji: string;
}