import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CoordinatesDto {
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  lon: number;

  @IsOptional()
  @IsString()
  units?: string;
}

export class CityDto {
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  units?: string;
}
