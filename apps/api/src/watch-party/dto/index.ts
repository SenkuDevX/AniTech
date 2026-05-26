import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WatchPartyStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

export class CreateWatchPartyDto {
  @ApiProperty()
  @IsString()
  animeId: string;

  @ApiProperty()
  @IsString()
  episodeId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxParticipants?: number;
}

export class JoinWatchPartyDto {
  @ApiProperty()
  @IsString()
  partyId: string;
}

export class WatchPartyQueryDto {
  @ApiPropertyOptional({ enum: WatchPartyStatus })
  @IsOptional()
  @IsEnum(WatchPartyStatus)
  status?: WatchPartyStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  animeId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}