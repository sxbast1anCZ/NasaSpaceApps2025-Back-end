import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenWeatherModule } from './openweather/openweather.module';
import { WeatherApiModule } from './weather-api/weather-api.module';
import { OpenAqModule } from './open-aq/open-aq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    OpenWeatherModule,
    WeatherApiModule,
      isGlobal: true, // Hace que ConfigModule esté disponible globalmente
      envFilePath: '.env', // Ruta al archivo .env
    }),
    OpenAqModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
