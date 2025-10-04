import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';

export enum AirQualityParameter {
  PM = 'pm',
  NO2 = 'no2',
  O3 = 'o3',
}

export class GetSensorsDto {
  @IsEnum(AirQualityParameter, {
    message: 'El parámetro debe ser uno de: pm, no2, o3',
  })
  parameter: AirQualityParameter;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 100;
}
