import { Module, Global } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { AirQualityProcessorService } from './services/air-quality-processor.service';

@Global()
@Module({
  providers: [PrismaService, AirQualityProcessorService],
  exports: [PrismaService, AirQualityProcessorService],
})
export class SharedModule {}
