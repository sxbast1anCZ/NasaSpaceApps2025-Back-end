import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AirQualityParameter {
  PM = 'pm',
  NO2 = 'no2',
  O3 = 'o3',
}

export class GetSensorsDto {
  @ApiProperty({
    enum: AirQualityParameter,
    description: 'Tipo de parámetro de calidad del aire a consultar',
    example: 'pm',
    required: true,
  })
  @IsEnum(AirQualityParameter, {
    message: 'El parámetro debe ser uno de: pm, no2, o3',
  })
  parameter: AirQualityParameter;

  @ApiProperty({
    type: Number,
    description: 'Límite de sensores a consultar',
    minimum: 1,
    maximum: 100,
    default: 100,
    required: false,
    example: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 100;
}
