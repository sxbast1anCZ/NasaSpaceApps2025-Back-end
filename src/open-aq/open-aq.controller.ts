import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { OpenAqService } from './open-aq.service';
import { GetSensorsDto } from './dto/get-sensors.dto';

@ApiTags('OpenAQ')
@Controller('open-aq')
export class OpenAqController {
  constructor(private readonly openAqService: OpenAqService) {}

  /**
   * Endpoint unificado para consultar sensores de calidad del aire en área TEMPO
   * @param query - Query params con parameter (pm, no2, o3) y limit opcional (1-100)
   * @returns Mediciones de sensores del parámetro especificado
   * 
   * Ejemplos:
   * GET /open-aq/tempo-sensors?parameter=pm
   * GET /open-aq/tempo-sensors?parameter=no2&limit=50
   * GET /open-aq/tempo-sensors?parameter=o3&limit=100
   */
  @Get('tempo-sensors')
  @ApiOperation({
    summary: 'Obtener sensores de calidad del aire en área TEMPO',
    description: 
      'Consulta sensores de calidad del aire (PM, NO2, O3) en el área de cobertura del satélite TEMPO.\n\n' +
      '**Área de cobertura TEMPO:**\n' +
      '- Latitud: -55° a 60° (Sur de Argentina hasta Norte de Canadá)\n' +
      '- Longitud: -140° a -30° (Océano Pacífico hasta Océano Atlántico)\n\n' +
      '**Parámetros disponibles:**\n' +
      '- `pm`: Material Particulado (PM2.5, PM10)\n' +
      '- `no2`: Dióxido de Nitrógeno\n' +
      '- `o3`: Ozono troposférico\n\n' +
      'Retorna hasta 100 sensores con sus últimas 10 mediciones cada uno.',
  })
  @ApiQuery({
    name: 'parameter',
    required: true,
    enum: ['pm', 'no2', 'o3'],
    description: 'Tipo de parámetro de calidad del aire a consultar',
    example: 'pm',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Límite de sensores a consultar (1-100)',
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Sensores y mediciones obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        parameter: {
          type: 'string',
          example: 'pm',
          description: 'Parámetro consultado',
        },
        parameterDisplayName: {
          type: 'string',
          example: 'PM (Particulate Matter)',
          description: 'Nombre para mostrar del parámetro',
        },
        tempoArea: {
          type: 'object',
          properties: {
            minLat: { type: 'number', example: -55 },
            maxLat: { type: 'number', example: 60 },
            minLon: { type: 'number', example: -140 },
            maxLon: { type: 'number', example: -30 },
          },
        },
        totalSensorsFound: {
          type: 'number',
          example: 875,
          description: 'Total de sensores encontrados en el área',
        },
        sensorsWithMeasurements: {
          type: 'number',
          example: 100,
          description: 'Cantidad de sensores consultados',
        },
        measurements: {
          type: 'array',
          description: 'Array con los datos de cada sensor',
          items: {
            type: 'object',
            properties: {
              sensorId: { type: 'number', example: 12345 },
              locationId: { type: 'number', example: 678 },
              locationName: { type: 'string', example: 'New York City Hall' },
              coordinates: {
                type: 'object',
                properties: {
                  latitude: { type: 'number', example: 40.7128 },
                  longitude: { type: 'number', example: -74.0060 },
                },
              },
              parameter: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'pm25' },
                  units: { type: 'string', example: 'µg/m³' },
                  displayName: { type: 'string', example: 'PM2.5' },
                },
              },
              measurements: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    value: { type: 'number', example: 12.5 },
                    datetime: {
                      type: 'object',
                      properties: {
                        utc: { type: 'string', example: '2025-10-04T22:00:00Z' },
                        local: { type: 'string', example: '2025-10-04T18:00:00-04:00' },
                      },
                    },
                  },
                },
              },
              totalMeasurements: { type: 'number', example: 10 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetro inválido o límite fuera de rango',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Parámetro inválido: "xyz". Valores permitidos: pm, no2, o3',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async getTempoSensors(@Query() query: GetSensorsDto) {
    const { parameter, limit = 100 } = query;
    return await this.openAqService.getSensorsByParameter(parameter, limit);
  }
}

