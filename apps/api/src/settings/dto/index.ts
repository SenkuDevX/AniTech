import { IsString, IsOptional, IsInt, Min, Max, IsBoolean, IsNumber, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() language?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subtitleLanguage?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(10) @Max(32) subtitleFontSize?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() subtitleColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(1) subtitleBgOpacity?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() subtitleOffset?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() themeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() autoSkipIntro?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() autoSkipOutro?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() autoNextEpisode?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() defaultQuality?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0.25) @Max(4) defaultPlaybackSpeed?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(1) volume?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() muted?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() enableNotifications?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() enableDesktopNotifications?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() privacyProfile?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() privacyWatchlist?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() showAdultContent?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() dataAnalytics?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() syncEnabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsArray() preferredProviders?: string[];
}