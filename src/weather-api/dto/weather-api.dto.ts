import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CurrentWeatherDto {
  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  aqi?: string;
}

export class ForecastDto {
  @IsString()
  location: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(14)
  days?: number;

  @IsOptional()
  @IsString()
  aqi?: string;
}

export class HistoryDto {
  @IsString()
  location: string;

  @IsString()
  date: string; // Format: yyyy-MM-dd
}

export class SearchDto {
  @IsString()
  query: string;
}

export class AstronomyDto {
  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  date?: string; // Format: yyyy-MM-dd
}

export class TimezoneDto {
  @IsString()
  location: string;
}
