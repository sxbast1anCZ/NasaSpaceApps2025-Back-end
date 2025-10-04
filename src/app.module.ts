import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenAqModule } from './open-aq/open-aq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigModule esté disponible globalmente
      envFilePath: '.env', // Ruta al archivo .env
    }),
    OpenAqModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
