import { Controller, Get, Query, Logger } from '@nestjs/common';
import { AirQualityProcessorService } from '../shared/services/air-quality-processor.service';

@Controller('air-quality')
export class AirQualityController {
  private readonly logger = new Logger(AirQualityController.name);

  constructor(private readonly airQualityService: AirQualityProcessorService) {}

  /**
   * GET /air-quality/dangerous-zones
   * Obtiene zonas con calidad de aire peligrosa (AQI > 150)
   * @param hours - Horas hacia atrás para buscar (default: 6)
   */
  @Get('dangerous-zones')
  async getDangerousZones(@Query('hours') hours?: string) {
    const hoursBack = hours ? parseInt(hours, 10) : 6;
    
    this.logger.log(`Buscando zonas peligrosas en las últimas ${hoursBack} horas`);
    
    const zones = await this.airQualityService.getDangerousZones(hoursBack);
    
    return {
      timestamp: new Date().toISOString(),
      hoursBack,
      count: zones.length,
      zones: zones.map(zone => ({
        location: zone.locationName,
        country: zone.country,
        coordinates: {
          lat: zone.latitude,
          lon: zone.longitude
        },
        pollutant: zone.parameter,
        concentration: zone.value,
        aqi: zone.aqi,
        category: zone.aqiCategory,
        healthAdvice: zone.healthAdvice,
        lastUpdate: zone.measurementDate,
        severity: this.getSeverityLevel(zone.aqi)
      }))
    };
  }

  /**
   * GET /air-quality/map-data
   * Obtiene datos para mapa de calor
   */
  @Get('map-data')
  async getMapData(@Query('hours') hours?: string) {
    const hoursBack = hours ? parseInt(hours, 10) : 12;
    
    const data = await this.airQualityService.getMapHeatmapData(hoursBack);
    
    return {
      timestamp: new Date().toISOString(),
      hoursBack,
      count: data.length,
      measurements: data.map(m => ({
        location: m.locationName,
        country: m.country,
        coordinates: {
          lat: m.latitude,
          lon: m.longitude
        },
        pollutant: m.parameter,
        concentration: m.value,
        aqi: m.aqi,
        category: m.aqiCategory,
        lastUpdate: m.measurementDate
      }))
    };
  }

  /**
   * GET /air-quality/health-advice
   * Obtiene recomendaciones de salud para una ubicación específica
   * @param lat - Latitud
   * @param lon - Longitud
   * @param radius - Radio de búsqueda en km (default: 50)
   */
  @Get('health-advice')
  async getHealthAdvice(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('radius') radius?: string
  ) {
    if (!lat || !lon) {
      return {
        error: 'Se requieren parámetros lat y lon',
        example: '/air-quality/health-advice?lat=19.4326&lon=-99.1332&radius=50'
      };
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusKm = radius ? parseInt(radius, 10) : 50;

    const advice = await this.airQualityService.getHealthAdviceForLocation(
      latitude,
      longitude,
      radiusKm
    );

    return advice;
  }

  /**
   * Determina nivel de severidad basado en AQI
   */
  private getSeverityLevel(aqi: number): string {
    if (aqi >= 301) return 'EXTREMO';
    if (aqi >= 201) return 'MUY_ALTO';
    if (aqi >= 151) return 'ALTO';
    return 'MODERADO';
  }
}
