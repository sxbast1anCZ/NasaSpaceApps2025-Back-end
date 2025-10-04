import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { OpenAqService } from './open-aq.service';
import { OpenAqController } from './open-aq.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [OpenAqController],
  providers: [OpenAqService],
  exports: [OpenAqService],
})
export class OpenAqModule {}
