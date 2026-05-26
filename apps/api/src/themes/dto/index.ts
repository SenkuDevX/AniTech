import { IsString, IsOptional, IsBoolean, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActivateThemeDto {
  @ApiProperty()
  @IsString()
  themeId: string;
}

export class CreateCustomThemeDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsObject()
  colors: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  fonts?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  spacing?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class ThemeQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOfficial?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;
}