import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
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

  private getHeaders() {
    return {
      'X-API-Key': this.apiKey,
    };
  }

  private getParameterDisplayName(parameter: string): string {
    const displayNames = {
      pm: 'PM (Particulate Matter)',
      no2: 'NO (Nitrogen Dioxide)',
      o3: 'O (Ozone)',
    };
    return displayNames[parameter.toLowerCase()] || parameter.toUpperCase();
  }

  async getSensorsByParameter(parameter: string, sensorLimit: number = 100) {
    try {
      const validParameters = ['pm', 'no2', 'o3'];
      const paramLower = parameter.toLowerCase();
      
      if (!validParameters.includes(paramLower)) {
        throw new BadRequestException(
          `Parámetro inválido: "${parameter}". Valores permitidos: ${validParameters.join(', ')}`
        );
      }

      if (sensorLimit < 1 || sensorLimit > 100) {
        throw new BadRequestException(
          'El límite de sensores debe estar entre 1 y 100'
        );
      }

      const tempoBounds = {
        minLat: -55,
        maxLat: 60,
        minLon: -140,
        maxLon: -30,
      };

      const paramDisplay = this.getParameterDisplayName(paramLower);
      
      console.log(`\n  Consultando OpenAQ API para sensores ${paramDisplay} en área de TEMPO...`);
      console.log(` Cobertura: Latitud [${tempoBounds.minLat}, ${tempoBounds.maxLat}], Longitud [${tempoBounds.minLon}, ${tempoBounds.maxLon}]`);

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/locations`, {
          headers: this.getHeaders(),
          params: {
            bbox: `${tempoBounds.minLon},${tempoBounds.minLat},${tempoBounds.maxLon},${tempoBounds.maxLat}`,
            limit: 1000,
          },
        }),
      );

      const data = response.data;
      const sensors: any[] = [];
      
      data.results?.forEach((location) => {
        location.sensors?.forEach((sensor) => {
          const sensorParamName = sensor.parameter?.name?.toLowerCase();
          let matches = false;
          
          if (paramLower === 'pm') {
            matches = sensorParamName?.startsWith('pm');
          } else {
            matches = sensorParamName === paramLower;
          }

          if (matches) {
            sensors.push({
              sensorId: sensor.id,
              locationId: location.id,
              locationName: location.name,
              coordinates: location.coordinates,
              parameter: sensor.parameter,
            });
          }
        });
      });

      console.log(` Ubicaciones obtenidas: ${data.results?.length || 0}`);
      console.log(`  Total de sensores ${paramDisplay} encontrados: ${sensors.length}`);
      console.log(` Consultando mediciones de los primeros ${Math.min(sensorLimit, sensors.length)} sensores...`);

      const measurementsPromises = sensors.slice(0, sensorLimit).map(async (sensor) => {
        try {
          const measurementResponse = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}/sensors/${sensor.sensorId}/measurements`, {
              headers: this.getHeaders(),
              params: {
                limit: 10,
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
          console.warn(`  Error al obtener mediciones del sensor ${paramDisplay} ${sensor.sensorId}`);
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

      console.log(` Mediciones ${paramDisplay} obtenidas exitosamente`);
      console.log(` Sensores con mediciones: ${sensorMeasurements.length}\n`);

      return {
        parameter: paramLower,
        parameterDisplayName: paramDisplay,
        tempoArea: {
          minLat: tempoBounds.minLat,
          maxLat: tempoBounds.maxLat,
          minLon: tempoBounds.minLon,
          maxLon: tempoBounds.maxLon,
        },
        totalSensorsFound: sensors.length,
        sensorsWithMeasurements: sensorMeasurements.length,
        measurements: sensorMeasurements,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error(`\n Error al consultar OpenAQ ${parameter.toUpperCase()}:`, error.message);
      console.error(' Respuesta de error:', error.response?.data);

      throw new HttpException(
        {
          success: false,
          message: `Error al consultar OpenAQ API para sensores ${parameter.toUpperCase()} en área TEMPO`,
          error: error.response?.data?.detail || error.message,
        },
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
