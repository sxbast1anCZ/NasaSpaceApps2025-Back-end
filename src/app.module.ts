import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenWeatherModule } from './openweather/openweather.module';
import { WeatherApiModule } from './weather-api/weather-api.module';
import { OpenAqModule } from './open-aq/open-aq.module';
import { TempoModule } from './tempo/tempo.module';
import { SharedModule } from './shared/shared.module';
import { AirQualityModule } from './air-quality/air-quality.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SharedModule,
    OpenWeatherModule,
    WeatherApiModule,
    OpenAqModule,
    TempoModule,
    AirQualityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

