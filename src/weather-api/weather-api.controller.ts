import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { WeatherApiService } from './weather-api.service';

@ApiTags('WeatherAPI')
@Controller('weather-api')
export class WeatherApiController {
  constructor(private readonly weatherApiService: WeatherApiService) {}

  @Get('current')
  @ApiOperation({ 
    summary: 'Obtener clima actual con calidad del aire',
    description: 'Consulta el clima actual incluyendo temperatura, humedad, viento y datos de calidad del aire (PM2.5, PM10, O3, NO2, CO).'
  })
  @ApiQuery({ 
    name: 'location', 
    description: 'Ciudad o coordenadas (lat,lon)', 
    example: 'Mexico City', 
    required: true 
  })
  @ApiQuery({ 
    name: 'aqi', 
    description: 'Incluir datos de calidad del aire', 
    enum: ['yes', 'no'], 
    required: false,
    example: 'yes'
  })
  @ApiResponse({ status: 200, description: 'Datos del clima y AQI obtenidos exitosamente' })
  @ApiResponse({ status: 400, description: 'Ubicación no encontrada o parámetros inválidos' })
  async getCurrentWeather(
    @Query('location') location: string,
    @Query('aqi') aqi?: string,
  ) {
    return this.weatherApiService.getCurrentWeather(location, aqi || 'yes');
  }

  @Get('forecast')
  @ApiOperation({ 
    summary: 'Obtener pronóstico hasta 14 días',
    description: 'Consulta el pronóstico meteorológico con datos diarios y por hora, incluyendo calidad del aire.'
  })
  @ApiQuery({ name: 'location', description: 'Ciudad o coordenadas', example: 'Monterrey', required: true })
  @ApiQuery({ name: 'days', description: 'Número de días (1-14)', example: '5', required: false })
  @ApiQuery({ name: 'aqi', description: 'Incluir calidad del aire', enum: ['yes', 'no'], required: false, example: 'yes' })
  @ApiResponse({ status: 200, description: 'Pronóstico obtenido exitosamente' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos (días debe ser 1-14)' })
  async getForecast(
    @Query('location') location: string,
    @Query('days') days?: string,
    @Query('aqi') aqi?: string,
  ) {
    const numDays = days ? parseInt(days) : 3;
    return this.weatherApiService.getForecast(location, numDays, aqi || 'yes');
  }

  @Get('history')
  @ApiOperation({ 
    summary: 'Obtener datos históricos del clima',
    description: 'Consulta datos meteorológicos de una fecha pasada específica.'
  })
  @ApiQuery({ name: 'location', description: 'Ciudad o coordenadas', example: 'Guadalajara', required: true })
  @ApiQuery({ name: 'date', description: 'Fecha en formato yyyy-MM-dd', example: '2025-09-15', required: true })
  @ApiResponse({ status: 200, description: 'Datos históricos obtenidos exitosamente' })
  @ApiResponse({ status: 400, description: 'Fecha inválida o fuera de rango' })
  async getHistory(
    @Query('location') location: string,
    @Query('date') date: string,
  ) {
    return this.weatherApiService.getHistory(location, date);
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Buscar y autocompletar ubicaciones',
    description: 'Busca ciudades y ubicaciones que coincidan con el término de búsqueda.'
  })
  @ApiQuery({ name: 'query', description: 'Término de búsqueda', example: 'Monte', required: true })
  @ApiResponse({ status: 200, description: 'Lista de ubicaciones encontradas' })
  @ApiResponse({ status: 400, description: 'Error en la búsqueda' })
  async searchLocation(@Query('query') query: string) {
    return this.weatherApiService.searchLocation(query);
  }

  @Get('astronomy')
  @ApiOperation({ 
    summary: 'Obtener datos astronómicos',
    description: 'Consulta datos de salida/puesta del sol, salida/puesta de la luna, fase lunar e iluminación.'
  })
  @ApiQuery({ name: 'location', description: 'Ciudad o coordenadas', example: 'Cancun', required: true })
  @ApiQuery({ name: 'date', description: 'Fecha en formato yyyy-MM-dd (opcional)', example: '2025-10-15', required: false })
  @ApiResponse({ status: 200, description: 'Datos astronómicos obtenidos exitosamente' })
  @ApiResponse({ status: 400, description: 'Ubicación o fecha inválida' })
  async getAstronomy(
    @Query('location') location: string,
    @Query('date') date?: string,
  ) {
    return this.weatherApiService.getAstronomy(location, date);
  }

  @Get('timezone')
  @ApiOperation({ 
    summary: 'Obtener zona horaria',
    description: 'Consulta información de zona horaria para una ubicación específica.'
  })
  @ApiQuery({ name: 'location', description: 'Ciudad o coordenadas', example: 'Tijuana', required: true })
  @ApiResponse({ status: 200, description: 'Información de zona horaria obtenida' })
  @ApiResponse({ status: 400, description: 'Ubicación no encontrada' })
  async getTimezone(@Query('location') location: string) {
    return this.weatherApiService.getTimezone(location);
  }
}
