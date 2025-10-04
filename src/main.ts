import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Habilitar CORS
  app.enableCors();

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('NASA Space Apps 2025 - Weather & Air Quality API')
    .setDescription(
      'API para consultar datos meteorológicos y de calidad del aire.\n\n' +
      '## APIs Integradas:\n' +
      '- **OpenAQ**: Red global de sensores de calidad del aire en tiempo real\n' +
      '- **OpenWeatherMap**: Clima actual, pronóstico y contaminación del aire\n' +
      '- **WeatherAPI.com**: Clima completo, historial, astronomía y más\n\n' +
      '## Cobertura TEMPO:\n' +
      'El satélite TEMPO cubre América del Norte y del Sur:\n' +
      '- **Latitud**: -55° a 60° (Sur de Argentina hasta Norte de Canadá)\n' +
      '- **Longitud**: -140° a -30° (Océano Pacífico hasta Océano Atlántico)\n\n' +
      '## Contaminantes Monitoreados:\n' +
      '- **PM2.5, PM10**: Material Particulado\n' +
      '- **O3**: Ozono troposférico\n' +
      '- **NO2**: Dióxido de Nitrógeno\n' +
      '- **SO2**: Dióxido de Azufre\n' +
      '- **CO**: Monóxido de Carbono'
    )
    .setVersion('2.0.0')
    .addTag('OpenAQ', 'Endpoints de OpenAQ - Sensores de calidad del aire en área TEMPO')
    .addTag('OpenWeather', 'Endpoints de OpenWeatherMap API')
    .addTag('WeatherAPI', 'Endpoints de WeatherAPI.com')
    .addTag('Health', 'Health checks y utilidades')
    .setContact(
      'NASA Space Apps Team',
      'https://github.com/sxbast1anCZ/NasaSpaceApps2025-Back-end',
      ''
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'NASA Weather API - Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  
  console.log(`\n🚀 Servidor iniciado en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api\n`);
}
bootstrap();
