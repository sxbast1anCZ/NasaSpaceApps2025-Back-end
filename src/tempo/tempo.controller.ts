import { Controller, Post, Get, Body, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { TempoService } from './tempo.service';
import { TempoDataDto } from './dto/tempo-data.dto';

@ApiTags('TEMPO')
@Controller('tempo')
export class TempoController {
  private readonly logger = new Logger(TempoController.name);

  constructor(private readonly tempoService: TempoService) {}

  @Post('ingest')
  @ApiOperation({ 
    summary: 'Ingesta de datos TEMPO desde JSON',
    description: 'Recibe datos de mediciones TEMPO (O3 o NO2) y los almacena en la base de datos de forma optimizada'
  })
  @ApiBody({ type: TempoDataDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Datos procesados exitosamente',
    schema: {
      example: {
        totalProcessed: 45678,
        totalDuration: 2345,
        batchesProcessed: 10,
        rate: '19.47 mediciones/ms'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async ingestTempoData(@Body() tempoData: TempoDataDto) {
    this.logger.log(`Recibida solicitud de ingesta con ${tempoData.measurements?.length || 0} mediciones`);
    
    const result = await this.tempoService.processTempoJson(tempoData);
    
    return {
      ...result,
      rate: `${(result.totalProcessed / result.totalDuration).toFixed(2)} mediciones/ms`,
    };
  }

  @Get('measurements')
  @ApiOperation({ 
    summary: 'Obtener mediciones TEMPO',
    description: 'Consulta mediciones TEMPO filtradas por contaminante y rango de fechas'
  })
  @ApiQuery({ name: 'pollutant', required: false, enum: ['O3', 'NO2'], description: 'Tipo de contaminante' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha de inicio (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha de fin (ISO 8601)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de resultados', example: 1000 })
  @ApiResponse({ 
    status: 200, 
    description: 'Mediciones obtenidas exitosamente',
  })
  async getMeasurements(
    @Query('pollutant') pollutant?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const lim = limit ? parseInt(limit.toString()) : 1000;

    return this.tempoService.getMeasurements(pollutant, start, end, lim);
  }

  @Get('measurements/location')
  @ApiOperation({ 
    summary: 'Obtener mediciones por ubicación',
    description: 'Consulta mediciones TEMPO cerca de una ubicación geográfica específica'
  })
  @ApiQuery({ name: 'latitude', required: true, type: Number, description: 'Latitud' })
  @ApiQuery({ name: 'longitude', required: true, type: Number, description: 'Longitud' })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Radio de búsqueda en grados (default: 0.5)', example: 0.5 })
  @ApiQuery({ name: 'pollutant', required: false, enum: ['O3', 'NO2'], description: 'Tipo de contaminante' })
  @ApiResponse({ 
    status: 200, 
    description: 'Mediciones obtenidas exitosamente',
  })
  async getMeasurementsByLocation(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius?: string,
    @Query('pollutant') pollutant?: string,
  ) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const rad = radius ? parseFloat(radius) : 0.5;

    return this.tempoService.getMeasurementsByLocation(lat, lon, rad, pollutant);
  }
}
