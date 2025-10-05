import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenWeatherModule } from './openweather/openweather.module';
import { WeatherApiModule } from './weather-api/weather-api.module';
import { OpenAqModule } from './open-aq/open-aq.module';
import { TempoModule } from './tempo/tempo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    OpenWeatherModule,
    WeatherApiModule,
    OpenAqModule,
    TempoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

