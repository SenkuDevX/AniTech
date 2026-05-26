import { IsString, IsOptional, IsEnum, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DownloadQuality {
  SD = 'SD',
  HD = 'HD',
  FHD = 'FHD',
  QHD = 'QHD',
  UHD = 'UHD',
}

export enum DownloadStatus {
  PENDING = 'PENDING',
  DOWNLOADING = 'DOWNLOADING',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  FAILED = 'FAILED',
}

export class CreateDownloadDto {
  @ApiProperty()
  @IsString()
  animeId: string;

  @ApiProperty()
  @IsString()
  episodeId: string;

  @ApiPropertyOptional({ enum: DownloadQuality, default: 'HD' })
  @IsOptional()
  @IsEnum(DownloadQuality)
  quality?: DownloadQuality;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;
}

export class DownloadQueryDto {
  @ApiPropertyOptional({ enum: DownloadStatus })
  @IsOptional()
  @IsEnum(DownloadStatus)
  status?: DownloadStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class BatchDownloadDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  episodeIds: string[];

  @ApiPropertyOptional({ enum: DownloadQuality })
  @IsOptional()
  @IsEnum(DownloadQuality)
  quality?: DownloadQuality;
}