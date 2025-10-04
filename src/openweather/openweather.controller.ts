import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { OpenWeatherService } from './openweather.service';

@ApiTags('OpenWeather')
@Controller('openweather')
export class OpenWeatherController {
  constructor(private readonly openWeatherService: OpenWeatherService) {}

  @Get('current/coords')
  @ApiOperation({ 
    summary: 'Obtener clima actual por coordenadas',
    description: 'Consulta el clima actual de una ubicación específica usando coordenadas geográficas.'
  })
  @ApiQuery({ name: 'lat', description: 'Latitud (-90 a 90)', example: '19.4326', required: true })
  @ApiQuery({ name: 'lon', description: 'Longitud (-180 a 180)', example: '-99.1332', required: true })
  @ApiQuery({ name: 'units', description: 'Sistema de unidades', enum: ['metric', 'imperial', 'standard'], required: false, example: 'metric' })
  @ApiResponse({ status: 200, description: 'Datos del clima obtenidos exitosamente' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos o error de la API' })
  async getCurrentByCoords(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('units') units?: string,
  ) {
    return this.openWeatherService.getCurrentWeatherByCoords(
      parseFloat(lat),
      parseFloat(lon),
      units || 'metric',
    );
  }

  @Get('current/city')
  @ApiOperation({ 
    summary: 'Obtener clima actual por ciudad',
    description: 'Consulta el clima actual de una ciudad específica.'
  })
  @ApiQuery({ name: 'city', description: 'Nombre de la ciudad', example: 'Mexico City', required: true })
  @ApiQuery({ name: 'units', description: 'Sistema de unidades', enum: ['metric', 'imperial', 'standard'], required: false, example: 'metric' })
  @ApiResponse({ status: 200, description: 'Datos del clima obtenidos exitosamente' })
  @ApiResponse({ status: 400, description: 'Ciudad no encontrada o parámetros inválidos' })
  async getCurrentByCity(
    @Query('city') city: string,
    @Query('units') units?: string,
  ) {
    return this.openWeatherService.getCurrentWeatherByCity(
      city,
      units || 'metric',
    );
  }

  @Get('forecast/coords')
  @ApiOperation({ 
    summary: 'Obtener pronóstico de 5 días por coordenadas',
    description: 'Consulta el pronóstico meteorológico de 5 días con intervalos de 3 horas.'
  })
  @ApiQuery({ name: 'lat', description: 'Latitud', example: '19.4326', required: true })
  @ApiQuery({ name: 'lon', description: 'Longitud', example: '-99.1332', required: true })
  @ApiQuery({ name: 'units', description: 'Sistema de unidades', enum: ['metric', 'imperial', 'standard'], required: false })
  @ApiResponse({ status: 200, description: 'Pronóstico obtenido exitosamente' })
  @ApiResponse({ status: 400, description: 'Error en la consulta' })
  async getForecastByCoords(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('units') units?: string,
  ) {
    return this.openWeatherService.getForecastByCoords(
      parseFloat(lat),
      parseFloat(lon),
      units || 'metric',
    );
  }

  @Get('forecast/city')
  @ApiOperation({ 
    summary: 'Obtener pronóstico de 5 días por ciudad',
    description: 'Consulta el pronóstico meteorológico de 5 días para una ciudad específica.'
  })
  @ApiQuery({ name: 'city', description: 'Nombre de la ciudad', example: 'Monterrey', required: true })
  @ApiQuery({ name: 'units', description: 'Sistema de unidades', enum: ['metric', 'imperial', 'standard'], required: false })
  @ApiResponse({ status: 200, description: 'Pronóstico obtenido exitosamente' })
  @ApiResponse({ status: 400, description: 'Ciudad no encontrada' })
  async getForecastByCity(
    @Query('city') city: string,
    @Query('units') units?: string,
  ) {
    return this.openWeatherService.getForecastByCity(city, units || 'metric');
  }

  @Get('air-pollution')
  @ApiOperation({ 
    summary: 'Obtener contaminación del aire',
    description: 'Consulta datos de calidad del aire incluyendo PM2.5, PM10, O3, NO2, SO2, CO y el índice AQI (1-5).'
  })
  @ApiQuery({ name: 'lat', description: 'Latitud', example: '19.4326', required: true })
  @ApiQuery({ name: 'lon', description: 'Longitud', example: '-99.1332', required: true })
  @ApiResponse({ 
    status: 200, 
    description: 'Datos de contaminación obtenidos exitosamente. AQI: 1=Bueno, 2=Aceptable, 3=Moderado, 4=Malo, 5=Muy malo' 
  })
  @ApiResponse({ status: 400, description: 'Coordenadas inválidas' })
  async getAirPollution(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ) {
    return this.openWeatherService.getAirPollution(
      parseFloat(lat),
      parseFloat(lon),
    );
  }
}
