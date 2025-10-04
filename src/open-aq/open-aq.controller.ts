import { Controller, Get, Query } from '@nestjs/common';
import { OpenAqService } from './open-aq.service';
import { GetSensorsDto } from './dto/get-sensors.dto';

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
  async getTempoSensors(@Query() query: GetSensorsDto) {
    const { parameter, limit = 100 } = query;
    return await this.openAqService.getSensorsByParameter(parameter, limit);
  }
}

