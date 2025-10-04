import { Controller, Get } from '@nestjs/common';
import { OpenAqService } from './open-aq.service';

@Controller('open-aq')
export class OpenAqController {
  constructor(private readonly openAqService: OpenAqService) {}

  @Get('tempo-sensors')
  async getTempoSensors() {
    return await this.openAqService.getLocationsFromOpenAQ();
  }
}
