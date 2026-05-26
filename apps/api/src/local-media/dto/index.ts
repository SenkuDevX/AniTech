import { IsString, IsOptional, IsNumber, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocalMediaQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
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

export class ScanMediaDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  paths: string[];
}

export class MatchMediaDto {
  @ApiProperty()
  @IsString()
  mediaId: string;

  @ApiProperty()
  @IsString()
  animeId: string;
}