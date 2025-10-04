import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WeatherApiService } from './weather-api.service';
import { WeatherApiController } from './weather-api.controller';

@Module({
  imports: [HttpModule],
  controllers: [WeatherApiController],
  providers: [WeatherApiService],
  exports: [WeatherApiService],
})
export class WeatherApiModule {}
