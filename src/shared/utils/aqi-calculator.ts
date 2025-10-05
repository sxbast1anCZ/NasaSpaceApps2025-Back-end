/**
 * Servicio de utilidades para calcular AQI (Air Quality Index)
 * Basado en estándares EPA de Estados Unidos
 */

export class AqiCalculator {
  /**
   * Calcula el AQI para PM2.5
   */
  static calculatePM25AQI(concentration: number): { aqi: number; category: string; healthAdvice: string } {
    let aqi: number;
    
    if (concentration >= 0 && concentration <= 12.0) {
      aqi = this.linearInterpolation(concentration, 0, 12.0, 0, 50);
    } else if (concentration <= 35.4) {
      aqi = this.linearInterpolation(concentration, 12.1, 35.4, 51, 100);
    } else if (concentration <= 55.4) {
      aqi = this.linearInterpolation(concentration, 35.5, 55.4, 101, 150);
    } else if (concentration <= 150.4) {
      aqi = this.linearInterpolation(concentration, 55.5, 150.4, 151, 200);
    } else if (concentration <= 250.4) {
      aqi = this.linearInterpolation(concentration, 150.5, 250.4, 201, 300);
    } else if (concentration <= 350.4) {
      aqi = this.linearInterpolation(concentration, 250.5, 350.4, 301, 400);
    } else {
      aqi = this.linearInterpolation(concentration, 350.5, 500.4, 401, 500);
    }

    return {
      aqi: Math.round(aqi),
      category: this.getCategory(Math.round(aqi)),
      healthAdvice: this.getHealthAdvice(Math.round(aqi))
    };
  }

  /**
   * Calcula el AQI para PM10
   */
  static calculatePM10AQI(concentration: number): { aqi: number; category: string; healthAdvice: string } {
    let aqi: number;
    
    if (concentration >= 0 && concentration <= 54) {
      aqi = this.linearInterpolation(concentration, 0, 54, 0, 50);
    } else if (concentration <= 154) {
      aqi = this.linearInterpolation(concentration, 55, 154, 51, 100);
    } else if (concentration <= 254) {
      aqi = this.linearInterpolation(concentration, 155, 254, 101, 150);
    } else if (concentration <= 354) {
      aqi = this.linearInterpolation(concentration, 255, 354, 151, 200);
    } else if (concentration <= 424) {
      aqi = this.linearInterpolation(concentration, 355, 424, 201, 300);
    } else if (concentration <= 504) {
      aqi = this.linearInterpolation(concentration, 425, 504, 301, 400);
    } else {
      aqi = this.linearInterpolation(concentration, 505, 604, 401, 500);
    }

    return {
      aqi: Math.round(aqi),
      category: this.getCategory(Math.round(aqi)),
      healthAdvice: this.getHealthAdvice(Math.round(aqi))
    };
  }

  /**
   * Calcula el AQI para O3 (Ozono)
   */
  static calculateO3AQI(concentration: number): { aqi: number; category: string; healthAdvice: string } {
    let aqi: number;
    
    if (concentration >= 0 && concentration <= 54) {
      aqi = this.linearInterpolation(concentration, 0, 54, 0, 50);
    } else if (concentration <= 70) {
      aqi = this.linearInterpolation(concentration, 55, 70, 51, 100);
    } else if (concentration <= 85) {
      aqi = this.linearInterpolation(concentration, 71, 85, 101, 150);
    } else if (concentration <= 105) {
      aqi = this.linearInterpolation(concentration, 86, 105, 151, 200);
    } else if (concentration <= 200) {
      aqi = this.linearInterpolation(concentration, 106, 200, 201, 300);
    } else {
      aqi = 301;
    }

    return {
      aqi: Math.round(aqi),
      category: this.getCategory(Math.round(aqi)),
      healthAdvice: this.getHealthAdvice(Math.round(aqi))
    };
  }

  /**
   * Calcula el AQI para NO2 (Dióxido de Nitrógeno)
   */
  static calculateNO2AQI(concentration: number): { aqi: number; category: string; healthAdvice: string } {
    let aqi: number;
    
    if (concentration >= 0 && concentration <= 53) {
      aqi = this.linearInterpolation(concentration, 0, 53, 0, 50);
    } else if (concentration <= 100) {
      aqi = this.linearInterpolation(concentration, 54, 100, 51, 100);
    } else if (concentration <= 360) {
      aqi = this.linearInterpolation(concentration, 101, 360, 101, 150);
    } else if (concentration <= 649) {
      aqi = this.linearInterpolation(concentration, 361, 649, 151, 200);
    } else if (concentration <= 1249) {
      aqi = this.linearInterpolation(concentration, 650, 1249, 201, 300);
    } else {
      aqi = this.linearInterpolation(concentration, 1250, 2049, 301, 500);
    }

    return {
      aqi: Math.round(aqi),
      category: this.getCategory(Math.round(aqi)),
      healthAdvice: this.getHealthAdvice(Math.round(aqi))
    };
  }

  /**
   * Interpolación lineal para calcular AQI
   */
  private static linearInterpolation(
    concentration: number,
    cLow: number,
    cHigh: number,
    aqiLow: number,
    aqiHigh: number
  ): number {
    return ((aqiHigh - aqiLow) / (cHigh - cLow)) * (concentration - cLow) + aqiLow;
  }

  /**
   * Obtiene la categoría según el valor de AQI
   */
  private static getCategory(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  /**
   * Obtiene recomendaciones de salud según el AQI
   */
  private static getHealthAdvice(aqi: number): string {
    if (aqi <= 50) {
      return 'La calidad del aire es satisfactoria. Disfruta tus actividades al aire libre.';
    }
    if (aqi <= 100) {
      return 'La calidad del aire es aceptable. Personas inusualmente sensibles deberían considerar reducir actividades prolongadas al aire libre.';
    }
    if (aqi <= 150) {
      return 'Niños, ancianos y personas con problemas respiratorios o cardíacos deberían limitar actividades prolongadas al aire libre. El público general puede realizar actividades normales.';
    }
    if (aqi <= 200) {
      return 'Todos pueden experimentar efectos en la salud. Grupos sensibles pueden experimentar efectos más graves. Evita actividades prolongadas al aire libre.';
    }
    if (aqi <= 300) {
      return '⚠️ ALERTA DE SALUD: Todos pueden experimentar efectos graves en la salud. Permanece en interiores tanto como sea posible y evita toda actividad al aire libre.';
    }
    return '🚨 EMERGENCIA DE SALUD: Condiciones peligrosas. Todos deben permanecer en interiores con ventanas cerradas. Si debes salir, usa mascarilla N95.';
  }

  /**
   * Determina el color para visualización según categoría
   */
  static getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'Good': '#00E400',
      'Moderate': '#FFFF00',
      'Unhealthy for Sensitive Groups': '#FF7E00',
      'Unhealthy': '#FF0000',
      'Very Unhealthy': '#8F3F97',
      'Hazardous': '#7E0023'
    };
    return colors[category] || '#808080';
  }
}
