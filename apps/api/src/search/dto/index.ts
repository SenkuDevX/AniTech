import { IsString, IsOptional, IsEnum, IsArray, IsInt, Min, Max, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchDto {
  @ApiProperty({ example: 'neon genesis' })
  @IsString()
  @MinLength(2)
  q: string;

  @ApiPropertyOptional({ enum: ['anime', 'user', 'episode', 'all'], default: 'anime' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  genres?: string[];

  @ApiPropertyOptional({ enum: ['WINTER', 'SPRING', 'SUMMER', 'FALL'] })
  @IsOptional()
  @IsString()
  season?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  format?: string;

  @ApiPropertyOptional({ description: 'Mood-based search (e.g. dark, chill, hype, sad, romantic)' })
  @IsOptional()
  @IsString()
  mood?: string;

  @ApiPropertyOptional({ enum: ['popularity', 'score', 'title', 'latest', 'trending'], default: 'popularity' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  perPage?: number;
}

export class GetPopularSearchesDto {
  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class SearchResponseDto {
  results: any[];
  total: number;
  page: number;
  perPage: number;
}