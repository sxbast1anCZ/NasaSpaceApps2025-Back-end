import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherApiService {
  private readonly apiKey: string;
  private readonly baseUrl = 'http://api.weatherapi.com/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('WEATHER_API_KEY') || '';
  }

  /**
   * Obtener clima actual
   */
  async getCurrentWeather(location: string, aqi: string = 'yes') {
    try {
      const url = `${this.baseUrl}/current.json`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            key: this.apiKey,
            q: location,
            aqi, // Include air quality data
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
   * Obtener pronóstico de hasta 14 días
   */
  async getForecast(location: string, days: number = 3, aqi: string = 'yes') {
    try {
      const url = `${this.baseUrl}/forecast.json`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            key: this.apiKey,
            q: location,
            days,
            aqi,
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
   * Obtener datos históricos del clima
   */
  async getHistory(location: string, date: string) {
    try {
      const url = `${this.baseUrl}/history.json`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            key: this.apiKey,
            q: location,
            dt: date, // Format: yyyy-MM-dd
            lang: 'es',
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error al obtener datos históricos: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Buscar/autocompletar ubicaciones
   */
  async searchLocation(query: string) {
    try {
      const url = `${this.baseUrl}/search.json`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            key: this.apiKey,
            q: query,
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error al buscar ubicación: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Obtener datos de astronomía (salida/puesta del sol, luna, etc.)
   */
  async getAstronomy(location: string, date?: string) {
    try {
      const url = `${this.baseUrl}/astronomy.json`;
      const params: any = {
        key: this.apiKey,
        q: location,
      };
      if (date) {
        params.dt = date;
      }
      const response = await firstValueFrom(
        this.httpService.get(url, { params }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error al obtener datos astronómicos: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Obtener zona horaria
   */
  async getTimezone(location: string) {
    try {
      const url = `${this.baseUrl}/timezone.json`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            key: this.apiKey,
            q: location,
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error al obtener zona horaria: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
