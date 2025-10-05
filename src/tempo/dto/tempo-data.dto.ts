import { IsString, IsNumber, IsDateString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TempoMeasurementDto {
  @ApiProperty({ example: 17.299999, description: 'Latitud de la medición' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -93.110001, description: 'Longitud de la medición' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: '2025-10-04T21:31:03Z', description: 'Timestamp de la medición' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ example: 'O3', description: 'Tipo de contaminante (O3 o NO2)' })
  @IsString()
  pollutant: string;

  // Campos para O3
  @ApiPropertyOptional({ example: 10.46, description: 'Concentración troposférica en ppb (O3)' })
  @IsNumber()
  @IsOptional()
  tropospheric_concentration_ppb?: number;

  @ApiPropertyOptional({ example: 261.4039, description: 'Columna vertical en DU (O3)' })
  @IsNumber()
  @IsOptional()
  vertical_column_du?: number;

  // Campos para NO2
  @ApiPropertyOptional({ example: 0.92, description: 'Concentración superficial en µg/m³ (NO2)' })
  @IsNumber()
  @IsOptional()
  surface_concentration_ugm3?: number;

  @ApiPropertyOptional({ example: 1.2308, description: 'Columna vertical 1e15 molec/cm² (NO2)' })
  @IsNumber()
  @IsOptional()
  vertical_column_1e15?: number;

  @ApiProperty({ example: 10, description: 'Índice de calidad del aire' })
  @IsInt()
  @Min(0)
  @Max(500)
  aqi: number;

  @ApiProperty({ example: 'Bueno', description: 'Categoría AQI' })
  @IsString()
  aqi_category: string;

  @ApiProperty({ example: 1.0, description: 'Bandera de calidad de datos' })
  @IsNumber()
  quality_flag: number;
}

export class TempoDataDto {
  @ApiProperty({ type: [TempoMeasurementDto], description: 'Array de mediciones TEMPO' })
  measurements: TempoMeasurementDto[];
}
