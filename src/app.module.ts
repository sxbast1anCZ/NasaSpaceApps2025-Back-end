import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenWeatherModule } from './openweather/openweather.module';
import { WeatherApiModule } from './weather-api/weather-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    OpenWeatherModule,
    WeatherApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
