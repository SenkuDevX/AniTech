import { IsString, IsInt, Min, IsOptional, IsBoolean, IsNumber, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePlaybackDto {
  @ApiProperty()
  @IsString()
  animeId: string;

  @ApiProperty()
  @IsString()
  episodeId: string;

  @ApiProperty({ description: 'Progress in seconds' })
  @IsInt()
  @Min(0)
  progress: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  playbackSpeed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitleLang?: string;
}