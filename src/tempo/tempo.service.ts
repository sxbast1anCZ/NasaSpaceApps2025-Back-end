import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';
import { TempoMeasurementDto } from './dto/tempo-data.dto';

@Injectable()
export class TempoService {
  private readonly logger = new Logger(TempoService.name);
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Procesa e inserta mediciones TEMPO en lotes para máxima eficiencia
   * Usa transacciones y bulk inserts para optimizar el rendimiento
   */
  async processMeasurements(measurements: TempoMeasurementDto[]): Promise<{ count: number; duration: number }> {
    const startTime = Date.now();
    
    try {
      // Validar que hay datos
      if (!measurements || measurements.length === 0) {
        this.logger.warn('No se recibieron mediciones para procesar');
        return { count: 0, duration: 0 };
      }

      this.logger.log(`Procesando ${measurements.length} mediciones TEMPO`);

      // Preparar datos para inserción en lote
      const dataToInsert = measurements.map(measurement => ({
        latitude: measurement.latitude,
        longitude: measurement.longitude,
        timestamp: new Date(measurement.timestamp),
        pollutant: measurement.pollutant,
        // Soportar ambos formatos: O3 y NO2
        tropospheric_concentration_ppb: measurement.tropospheric_concentration_ppb || measurement.surface_concentration_ugm3 || 0,
        vertical_column_du: measurement.vertical_column_du || measurement.vertical_column_1e15 || 0,
        aqi: measurement.aqi,
        aqi_category: measurement.aqi_category,
        quality_flag: measurement.quality_flag,
      }));

      // Inserción en lote con transacción para máxima eficiencia
      const result = await this.prisma.tempoMeasurement.createMany({
        data: dataToInsert,
        skipDuplicates: true, // Evita errores si hay duplicados
      });

      const duration = Date.now() - startTime;
      
      this.logger.log(
        `✓ Insertadas ${result.count} mediciones en ${duration}ms (${(result.count / duration * 1000).toFixed(2)} mediciones/seg)`
      );

      return {
        count: result.count,
        duration,
      };
    } catch (error) {
      this.logger.error(`Error procesando mediciones TEMPO: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Procesa un JSON completo de TEMPO (puede contener miles de mediciones)
   * Divide en lotes si es necesario para evitar saturar la memoria
   */
  async processTempoJson(jsonData: { measurements: TempoMeasurementDto[] }): Promise<{
    totalProcessed: number;
    totalDuration: number;
    batchesProcessed: number;
  }> {
    const BATCH_SIZE = 5000; // Procesar en lotes de 5000 para optimizar memoria y velocidad
    const measurements = jsonData.measurements;
    const totalMeasurements = measurements.length;
    
    this.logger.log(`Iniciando procesamiento de ${totalMeasurements} mediciones TEMPO`);
    
    let totalProcessed = 0;
    let totalDuration = 0;
    let batchesProcessed = 0;

    // Procesar en lotes
    for (let i = 0; i < totalMeasurements; i += BATCH_SIZE) {
      const batch = measurements.slice(i, Math.min(i + BATCH_SIZE, totalMeasurements));
      const result = await this.processMeasurements(batch);
      
      totalProcessed += result.count;
      totalDuration += result.duration;
      batchesProcessed++;

      // Log de progreso
      const progress = ((i + batch.length) / totalMeasurements * 100).toFixed(2);
      this.logger.log(`Progreso: ${progress}% (${i + batch.length}/${totalMeasurements})`);
    }

    this.logger.log(
      `✓ Procesamiento completo: ${totalProcessed} mediciones en ${totalDuration}ms usando ${batchesProcessed} lotes`
    );

    return {
      totalProcessed,
      totalDuration,
      batchesProcessed,
    };
  }

  /**
   * Obtiene mediciones por rango de tiempo y contaminante
   * Optimizado con índices en la base de datos
   */
  async getMeasurements(
    pollutant?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 1000,
  ) {
    try {
      const where: any = {};

      if (pollutant) {
        where.pollutant = pollutant;
      }

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = startDate;
        if (endDate) where.timestamp.lte = endDate;
      }

      const measurements = await this.prisma.tempoMeasurement.findMany({
        where,
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
      });

      return measurements;
    } catch (error) {
      this.logger.error(`Error obteniendo mediciones: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene mediciones por ubicación geográfica
   */
  async getMeasurementsByLocation(
    latitude: number,
    longitude: number,
    radius: number = 0.5, // Radio en grados (aproximadamente 55km)
    pollutant?: string,
  ) {
    try {
      const where: any = {
        latitude: {
          gte: latitude - radius,
          lte: latitude + radius,
        },
        longitude: {
          gte: longitude - radius,
          lte: longitude + radius,
        },
      };

      if (pollutant) {
        where.pollutant = pollutant;
      }

      const measurements = await this.prisma.tempoMeasurement.findMany({
        where,
        orderBy: {
          timestamp: 'desc',
        },
        take: 1000,
      });

      return measurements;
    } catch (error) {
      this.logger.error(`Error obteniendo mediciones por ubicación: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
