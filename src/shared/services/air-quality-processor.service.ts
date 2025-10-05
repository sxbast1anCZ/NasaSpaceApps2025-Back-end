import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AqiCalculator } from '../utils/aqi-calculator';

interface OpenAQRawMeasurement {
  sensorId: number;
  locationId: number;
  locationName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  parameter: {
    id: number;
    name: string; // "pm10" o "pm25"
    units: string;
    displayName: string;
  };
  measurements: Array<{
    value: number;
    period: {
      datetimeFrom: {
        utc: string;
      };
    };
  }>;
}

@Injectable()
export class AirQualityProcessorService {
  private readonly logger = new Logger(AirQualityProcessorService.name);

  // Coordenadas de Norteamérica
  private readonly NORTH_AMERICA_BOUNDS = {
    minLat: 15,      // Sur de México
    maxLat: 72,      // Norte de Canadá/Alaska
    minLon: -170,    // Alaska Oeste
    maxLon: -52      // Este de Canadá
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Procesa y guarda mediciones de OpenAQ
   * Solo guarda datos de Norteamérica con mediciones recientes
   */
  async processOpenAQMeasurements(rawData: OpenAQRawMeasurement[]): Promise<{
    processed: number;
    saved: number;
    errors: number;
  }> {
    let processed = 0;
    let saved = 0;
    let errors = 0;

    for (const sensor of rawData) {
      try {
        // Filtrar solo Norteamérica
        if (!this.isInNorthAmerica(sensor.coordinates.latitude, sensor.coordinates.longitude)) {
          continue;
        }

        // Procesar cada medición del sensor
        for (const measurement of sensor.measurements) {
          processed++;

          try {
            const measurementDate = new Date(measurement.period.datetimeFrom.utc);
            
            // Solo guardar mediciones recientes (últimas 48 horas)
            const hoursSinceNow = (Date.now() - measurementDate.getTime()) / (1000 * 60 * 60);
            if (hoursSinceNow > 48) {
              continue;
            }

            // Calcular AQI según el tipo de contaminante
            const aqiData = this.calculateAQI(sensor.parameter.name, measurement.value);

            // Guardar en la base de datos
            await this.prisma.openAQMeasurement.create({
              data: {
                sensorId: sensor.sensorId,
                locationId: sensor.locationId,
                locationName: sensor.locationName,
                country: this.getCountryFromCoordinates(sensor.coordinates.latitude, sensor.coordinates.longitude),
                latitude: sensor.coordinates.latitude,
                longitude: sensor.coordinates.longitude,
                parameter: sensor.parameter.name,
                value: measurement.value,
                units: sensor.parameter.units,
                measurementDate: measurementDate,
                aqi: aqiData.aqi,
                aqiCategory: aqiData.category,
                healthAdvice: aqiData.healthAdvice,
              },
            });

            saved++;

            // Log de mediciones peligrosas
            if (aqiData.aqi > 150) {
              this.logger.warn(
                `⚠️ Zona peligrosa detectada: ${sensor.locationName} - AQI: ${aqiData.aqi} (${aqiData.category})`
              );
            }

          } catch (error) {
            errors++;
            this.logger.error(`Error procesando medición: ${error.message}`);
          }
        }

      } catch (error) {
        errors++;
        this.logger.error(`Error procesando sensor ${sensor.sensorId}: ${error.message}`);
      }
    }

    this.logger.log(`Procesamiento completado: ${processed} procesadas, ${saved} guardadas, ${errors} errores`);

    return { processed, saved, errors };
  }

  /**
   * Verifica si las coordenadas están en Norteamérica
   */
  private isInNorthAmerica(lat: number, lon: number): boolean {
    return (
      lat >= this.NORTH_AMERICA_BOUNDS.minLat &&
      lat <= this.NORTH_AMERICA_BOUNDS.maxLat &&
      lon >= this.NORTH_AMERICA_BOUNDS.minLon &&
      lon <= this.NORTH_AMERICA_BOUNDS.maxLon
    );
  }

  /**
   * Calcula AQI según el tipo de contaminante
   */
  private calculateAQI(parameter: string, value: number): { aqi: number; category: string; healthAdvice: string } {
    switch (parameter.toLowerCase()) {
      case 'pm25':
      case 'pm2.5':
        return AqiCalculator.calculatePM25AQI(value);
      case 'pm10':
        return AqiCalculator.calculatePM10AQI(value);
      default:
        // Si no conocemos el parámetro, asumimos bueno
        return {
          aqi: 0,
          category: 'Unknown',
          healthAdvice: 'Parámetro desconocido'
        };
    }
  }

  /**
   * Determina el país basado en coordenadas (aproximado)
   */
  private getCountryFromCoordinates(lat: number, lon: number): string {
    // Aproximación básica por rangos geográficos
    if (lat >= 49 && lat <= 72) {
      return 'Canada';
    } else if (lat >= 15 && lat <= 32 && lon >= -117 && lon <= -86) {
      return 'Mexico';
    } else if (lat >= 24 && lat <= 49 && lon >= -125 && lon <= -66) {
      return 'United States';
    } else if (lon < -140) {
      return 'United States'; // Alaska
    }
    return 'North America';
  }

  /**
   * Obtiene zonas peligrosas (AQI > 150)
   */
  async getDangerousZones(hoursBack: number = 6): Promise<any[]> {
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    return this.prisma.openAQMeasurement.findMany({
      where: {
        aqi: { gte: 151 },
        measurementDate: { gte: since }
      },
      select: {
        locationName: true,
        country: true,
        latitude: true,
        longitude: true,
        parameter: true,
        value: true,
        aqi: true,
        aqiCategory: true,
        healthAdvice: true,
        measurementDate: true,
      },
      orderBy: {
        aqi: 'desc'
      },
      take: 50
    });
  }

  /**
   * Obtiene datos para mapa de calor
   */
  async getMapHeatmapData(hoursBack: number = 12): Promise<any[]> {
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    // Obtener la medición más reciente por ubicación
    const measurements = await this.prisma.$queryRaw`
      SELECT DISTINCT ON (location_id, parameter)
        location_name as "locationName",
        country,
        latitude,
        longitude,
        parameter,
        value,
        aqi,
        aqi_category as "aqiCategory",
        measurement_date as "measurementDate"
      FROM openaq_measurements
      WHERE measurement_date >= ${since}
      ORDER BY location_id, parameter, measurement_date DESC
      LIMIT 500
    `;

    return measurements as any[];
  }

  /**
   * Obtiene recomendación de salud para una ubicación específica
   */
  async getHealthAdviceForLocation(lat: number, lon: number, radiusKm: number = 50): Promise<any> {
    // Convertir km a grados (aproximado: 1 grado ≈ 111 km)
    const radiusDegrees = radiusKm / 111;

    const nearbyMeasurements = await this.prisma.openAQMeasurement.findMany({
      where: {
        latitude: { gte: lat - radiusDegrees, lte: lat + radiusDegrees },
        longitude: { gte: lon - radiusDegrees, lte: lon + radiusDegrees },
        measurementDate: {
          gte: new Date(Date.now() - 6 * 60 * 60 * 1000) // Últimas 6 horas
        }
      },
      orderBy: {
        measurementDate: 'desc'
      },
      take: 10
    });

    if (nearbyMeasurements.length === 0) {
      return {
        location: { lat, lon },
        status: 'no_data',
        message: 'No hay datos disponibles para esta ubicación'
      };
    }

    // Obtener el peor AQI de la zona
    const worstMeasurement = nearbyMeasurements.reduce((worst, current) =>
      (current.aqi ?? 0) > (worst.aqi ?? 0) ? current : worst
    );

    return {
      location: { lat, lon },
      nearestStation: worstMeasurement.locationName,
      distance: this.calculateDistance(lat, lon, worstMeasurement.latitude, worstMeasurement.longitude),
      aqi: worstMeasurement.aqi,
      category: worstMeasurement.aqiCategory,
      healthAdvice: worstMeasurement.healthAdvice,
      pollutants: nearbyMeasurements.map(m => ({
        type: m.parameter,
        value: m.value,
        aqi: m.aqi
      })),
      lastUpdate: worstMeasurement.measurementDate
    };
  }

  /**
   * Calcula distancia entre dos puntos (Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
