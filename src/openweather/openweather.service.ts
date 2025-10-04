import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OpenWeatherService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('OPENWEATHER_API_KEY') || '';
  }

  /**
   * Obtener clima actual por coordenadas
   */
  async getCurrentWeatherByCoords(lat: number, lon: number, units = 'metric') {
    try {
      const url = `${this.baseUrl}/weather`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            lat,
            lon,
            appid: this.apiKey,
            units,
            lang: 'es',
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error al obtener clima actual: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Obtener clima actual por nombre de ciudad
   */
  async getCurrentWeatherByCity(city: string, units = 'metric') {
    try {
      const url = `${this.baseUrl}/weather`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            q: city,
            appid: this.apiKey,
            units,
            lang: 'es',
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error al obtener clima para ${city}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Obtener pronóstico de 5 días por coordenadas
   */
  async getForecastByCoords(lat: number, lon: number, units = 'metric') {
    try {
      const url = `${this.baseUrl}/forecast`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            lat,
            lon,
            appid: this.apiKey,
            units,
            lang: 'es',
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error al obtener pronóstico: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Obtener pronóstico de 5 días por ciudad
   */
  async getForecastByCity(city: string, units = 'metric') {
    try {
      const url = `${this.baseUrl}/forecast`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            q: city,
            appid: this.apiKey,
            units,
            lang: 'es',
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error al obtener pronóstico para ${city}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Obtener datos de contaminación del aire
   */
  async getAirPollution(lat: number, lon: number) {
    try {
      const url = `${this.baseUrl}/air_pollution`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            lat,
            lon,
            appid: this.apiKey,
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error al obtener contaminación del aire: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
