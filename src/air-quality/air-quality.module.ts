import { Module } from '@nestjs/common';
import { AirQualityController } from './air-quality.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [AirQualityController],
})
export class AirQualityModule {}
