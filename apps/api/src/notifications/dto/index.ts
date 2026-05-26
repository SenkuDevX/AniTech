import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  NEW_EPISODE = 'NEW_EPISODE',
  WATCH_PARTY = 'WATCH_PARTY',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  FRIEND_ACCEPTED = 'FRIEND_ACCEPTED',
  ACHIEVEMENT = 'ACHIEVEMENT',
  COMMENT = 'COMMENT',
  REACTION = 'REACTION',
  SYSTEM = 'SYSTEM',
}

export class NotificationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;
}

export class MarkReadDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notificationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}

export class UpdateNotificationSettingsDto {
  @ApiProperty()
  @IsBoolean()
  pushEnabled: boolean;

  @ApiProperty()
  @IsBoolean()
  emailEnabled: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  mutedTypes?: string[];
}