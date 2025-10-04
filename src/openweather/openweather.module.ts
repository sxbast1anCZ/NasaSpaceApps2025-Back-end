import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OpenWeatherService } from './openweather.service';
import { OpenWeatherController } from './openweather.controller';

@Module({
  imports: [HttpModule],
  controllers: [OpenWeatherController],
  providers: [OpenWeatherService],
  exports: [OpenWeatherService],
})
export class OpenWeatherModule {}
