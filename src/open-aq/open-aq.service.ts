import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OpenAqService {
  private readonly baseUrl = 'https://api.openaq.org/v3';
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('OPENAQ_API_KEY') || '';
    if (!this.apiKey) {
      console.warn('OPENAQ_API_KEY no está configurada en el archivo .env');
    } else {
      console.log('OPENAQ_API_KEY cargada correctamente');
    }
  }

  /**
   * Headers con API Key para todas las peticiones a OpenAQ
   */
  private getHeaders() {
    return {
      'X-API-Key': this.apiKey,
    };
  }

  /**
   * Consulta todos los sensores PM en el área de cobertura del satélite TEMPO
   * y obtiene las mediciones más recientes de cada sensor
   * TEMPO cubre América del Norte y del Sur aproximadamente:
   * Latitud: -55° a 60° (desde el sur de Argentina hasta el norte de Canadá)
   * Longitud: -140° a -30° (desde el Pacífico hasta el Atlántico)
   * @returns Mediciones de PM de todos los sensores en la región de TEMPO
   */
  async getLocationsFromOpenAQ() {
    try {
      // Área de cobertura de TEMPO (bounding box)
      const tempoBounds = {
        minLat: -55,  // Sur de Argentina
        maxLat: 60,   // Norte de Canadá/Alaska
        minLon: -140, // Costa Pacífico
        maxLon: -30,  // Costa Atlántico
      };

      console.log(`\nConsultando OpenAQ API para área de TEMPO...`);
      console.log(`Cobertura: Latitud [${tempoBounds.minLat}, ${tempoBounds.maxLat}], Longitud [${tempoBounds.minLon}, ${tempoBounds.maxLon}]`);

      // Hacer petición a OpenAQ con bounding box
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/locations`, {
          headers: this.getHeaders(),
          params: {
            // Usar bounding box en formato: minLon,minLat,maxLon,maxLat
            bbox: `${tempoBounds.minLon},${tempoBounds.minLat},${tempoBounds.maxLon},${tempoBounds.maxLat}`,
            limit: 1000, // Máximo permitido para cubrir toda la región
          },
        }),
      );

      const data = response.data;

      // Extraer información de sensores PM con sus ubicaciones
      const pmSensors: any[] = [];
      
      data.results?.forEach((location) => {
        location.sensors?.forEach((sensor) => {
          // Filtrar solo sensores que empiecen con "PM" (PM2.5, PM10, etc.)
          if (sensor.parameter?.name?.toLowerCase().startsWith('pm')) {
            pmSensors.push({
              sensorId: sensor.id,
              locationId: location.id,
              locationName: location.name,
              coordinates: location.coordinates,
              parameter: sensor.parameter,
            });
          }
        });
      });

      console.log(`Ubicaciones obtenidas: ${data.results?.length || 0}`);
      console.log(`Total de sensores PM encontrados: ${pmSensors.length}`);
      console.log(`Consultando mediciones de cada sensor...`);

      // Consultar mediciones de cada sensor (limitamos a los primeros para no saturar)
      const measurementsPromises = pmSensors.slice(0, 100).map(async (sensor) => {
        try {
          const measurementResponse = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}/sensors/${sensor.sensorId}/measurements`, {
              headers: this.getHeaders(),
              params: {
                limit: 10, // Últimas 10 mediciones
              },
            }),
          );

          return {
            sensorId: sensor.sensorId,
            locationId: sensor.locationId,
            locationName: sensor.locationName,
            coordinates: sensor.coordinates,
            parameter: sensor.parameter,
            measurements: measurementResponse.data.results || [],
            totalMeasurements: measurementResponse.data.meta?.found || 0,
          };
        } catch (error) {
          console.warn(`Error al obtener mediciones del sensor ${sensor.sensorId}`);
          return {
            sensorId: sensor.sensorId,
            locationId: sensor.locationId,
            locationName: sensor.locationName,
            coordinates: sensor.coordinates,
            parameter: sensor.parameter,
            measurements: [],
            error: 'No se pudieron obtener mediciones',
          };
        }
      });

      const sensorMeasurements = await Promise.all(measurementsPromises);

      console.log(`Mediciones obtenidas exitosamente`);
      console.log(`Sensores con mediciones: ${sensorMeasurements.length}\n`);

      return {
        tempoArea: {
          minLat: tempoBounds.minLat,
          maxLat: tempoBounds.maxLat,
          minLon: tempoBounds.minLon,
          maxLon: tempoBounds.maxLon,
        },
        totalSensorsFound: pmSensors.length,
        sensorsWithMeasurements: sensorMeasurements.length,
        pmMeasurements: sensorMeasurements,
      };
    } catch (error) {
      console.error('\nError al consultar OpenAQ:', error.message);
      console.error('Respuesta de error:', error.response?.data);

      throw new HttpException(
        {
          success: false,
          message: 'Error al consultar OpenAQ API para área TEMPO',
          error: error.response?.data?.detail || error.message,
        },
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
