# Sistema de Calidad de Aire - Documentación Completa

## 🎯 Resumen del Sistema

Este sistema procesa y analiza datos de calidad de aire de Norteamérica, combinando mediciones de sensores terrestres (OpenAQ) con datos satelitales (NASA TEMPO). Calcula automáticamente el AQI (Air Quality Index) y proporciona recomendaciones de salud en español.

---

## 📊 Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/Next.js)                  │
│                     Mapas + Alertas + Widgets                │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
┌──────────────────────────▼──────────────────────────────────┐
│                   NestJS Backend (Puerto 4000)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Air Quality  │  │   OpenAQ     │  │    TEMPO     │      │
│  │  Controller  │  │   Service    │  │   Service    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│  ┌──────▼─────────────────▼──────────────────▼───────┐      │
│  │      Air Quality Processor Service                 │      │
│  │  • Filtrado geográfico (Norteamérica)             │      │
│  │  • Cálculo AQI (PM2.5, PM10, O3, NO2)             │      │
│  │  • Generación de recomendaciones de salud         │      │
│  └────────────────────────┬───────────────────────────┘      │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────┐      │
│  │              Prisma ORM + PostgreSQL               │      │
│  │  Tables: openaq_measurements, tempo_measurements   │      │
│  └────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Estructura de la Base de Datos

### Tabla: `openaq_measurements`

Almacena mediciones de sensores terrestres con AQI calculado.

```sql
CREATE TABLE openaq_measurements (
  id SERIAL PRIMARY KEY,
  sensor_id INTEGER NOT NULL,
  location_id INTEGER NOT NULL,
  location_name TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  parameter TEXT NOT NULL,        -- 'pm25', 'pm10', 'o3', 'no2'
  value DECIMAL(10, 3) NOT NULL,  -- Concentración en µg/m³ o ppb
  units TEXT NOT NULL,
  measurement_date TIMESTAMP NOT NULL,
  aqi INTEGER,                    -- Índice de calidad de aire (0-500)
  aqi_category TEXT,              -- 'Good', 'Moderate', 'Unhealthy', etc.
  health_advice TEXT,             -- Recomendación en español
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_location_coords ON openaq_measurements(latitude, longitude);
CREATE INDEX idx_measurement_date ON openaq_measurements(measurement_date);
CREATE INDEX idx_aqi ON openaq_measurements(aqi);
```

### Tabla: `tempo_measurements`

Almacena datos satelitales de NASA TEMPO.

```sql
CREATE TABLE tempo_measurements (
  id SERIAL PRIMARY KEY,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  pollutant TEXT NOT NULL,        -- 'O3' o 'NO2'
  concentration DECIMAL(10, 3) NOT NULL,
  aqi INTEGER,
  aqi_category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tempo_coords ON tempo_measurements(latitude, longitude);
CREATE INDEX idx_tempo_timestamp ON tempo_measurements(timestamp);
```

---

## 🔧 Servicios Implementados

### 1. AqiCalculator (Utilidad)

**Archivo**: `src/shared/utils/aqi-calculator.ts`

Calcula el AQI basado en el estándar EPA de Estados Unidos.

**Métodos principales:**

```typescript
// PM2.5: Partículas finas (µg/m³)
calculatePM25AQI(concentration: number): { aqi, category, healthAdvice }

// PM10: Partículas gruesas (µg/m³)
calculatePM10AQI(concentration: number): { aqi, category, healthAdvice }

// O3: Ozono (ppb)
calculateO3AQI(concentration: number): { aqi, category, healthAdvice }

// NO2: Dióxido de nitrógeno (ppb)
calculateNO2AQI(concentration: number): { aqi, category, healthAdvice }

// Obtener color para visualización
getCategoryColor(category: string): string  // Retorna hex color
```

**Breakpoints EPA:**

| Contaminante | Good | Moderate | Unhealthy (Sensitive) | Unhealthy | Very Unhealthy | Hazardous |
|--------------|------|----------|-----------------------|-----------|----------------|-----------|
| PM2.5 (µg/m³)| 0-12 | 12.1-35.4| 35.5-55.4             | 55.5-150.4| 150.5-250.4    | 250.5-500 |
| PM10 (µg/m³) | 0-54 | 55-154   | 155-254               | 255-354   | 355-424        | 425-604   |
| O3 (ppb)     | 0-54 | 55-70    | 71-85                 | 86-105    | 106-200        | 201-500   |
| NO2 (ppb)    | 0-53 | 54-100   | 101-360               | 361-649   | 650-1249       | 1250-2049 |

---

### 2. AirQualityProcessorService

**Archivo**: `src/shared/services/air-quality-processor.service.ts`

Servicio principal de procesamiento de datos.

**Funciones clave:**

#### `processOpenAQMeasurements(rawData)`
Procesa datos crudos de OpenAQ:
- Filtra solo mediciones de Norteamérica (lat 15-72, lon -170 a -52)
- Solo guarda datos de las últimas 48 horas
- Calcula AQI automáticamente
- Genera recomendaciones de salud en español
- Guarda en la base de datos
- Registra alertas de zonas peligrosas (AQI > 150)

#### `getDangerousZones(hoursBack)`
Obtiene ubicaciones con AQI > 150:
```typescript
const zones = await service.getDangerousZones(6);
// Retorna: [{ locationName, country, lat, lon, aqi, category, healthAdvice, ... }]
```

#### `getMapHeatmapData(hoursBack)`
Obtiene datos para mapa de calor:
```typescript
const data = await service.getMapHeatmapData(12);
// Retorna medición más reciente por ubicación
```

#### `getHealthAdviceForLocation(lat, lon, radiusKm)`
Obtiene recomendaciones para una ubicación específica:
```typescript
const advice = await service.getHealthAdviceForLocation(19.4326, -99.1332, 50);
// Busca sensores en radio de 50km
// Retorna peor AQI encontrado + recomendaciones
```

---

## 🌐 API Endpoints

### Base URL: `http://localhost:4000`

### 1. **GET /air-quality/dangerous-zones**

Obtiene zonas con aire peligroso (AQI > 150).

**Query Parameters:**
- `hours` (opcional): Horas hacia atrás. Default: 6

**Respuesta:**
```json
{
  "timestamp": "2025-04-10T15:30:00Z",
  "hoursBack": 6,
  "count": 2,
  "zones": [
    {
      "location": "Ciudad de México",
      "country": "Mexico",
      "coordinates": { "lat": 19.4326, "lon": -99.1332 },
      "pollutant": "pm25",
      "concentration": 75.5,
      "aqi": 162,
      "category": "Unhealthy",
      "healthAdvice": "Todos deben reducir la actividad física al aire libre",
      "lastUpdate": "2025-04-10T15:00:00Z",
      "severity": "ALTO"
    }
  ]
}
```

---

### 2. **GET /air-quality/map-data**

Datos para mapa de calor.

**Query Parameters:**
- `hours` (opcional): Horas hacia atrás. Default: 12

**Respuesta:**
```json
{
  "timestamp": "2025-04-10T15:30:00Z",
  "hoursBack": 12,
  "count": 150,
  "measurements": [
    {
      "location": "Los Angeles",
      "country": "United States",
      "coordinates": { "lat": 34.0522, "lon": -118.2437 },
      "pollutant": "pm25",
      "concentration": 35.2,
      "aqi": 100,
      "category": "Moderate",
      "lastUpdate": "2025-04-10T15:00:00Z"
    }
  ]
}
```

---

### 3. **GET /air-quality/health-advice**

Recomendaciones de salud para una ubicación.

**Query Parameters:**
- `lat` (requerido): Latitud
- `lon` (requerido): Longitud
- `radius` (opcional): Radio en km. Default: 50

**Ejemplo:**
```
GET /air-quality/health-advice?lat=19.4326&lon=-99.1332&radius=50
```

**Respuesta:**
```json
{
  "location": { "lat": 19.4326, "lon": -99.1332 },
  "nearestStation": "Ciudad de México Centro",
  "distance": 5.2,
  "aqi": 125,
  "category": "Unhealthy for Sensitive Groups",
  "healthAdvice": "Personas con problemas respiratorios deben limitar actividades",
  "pollutants": [
    { "type": "pm25", "value": 45.3, "aqi": 125 },
    { "type": "pm10", "value": 78.1, "aqi": 87 }
  ],
  "lastUpdate": "2025-04-10T15:00:00Z"
}
```

---

## 📝 Categorías AQI y Recomendaciones

| AQI | Categoría | Color | Recomendación |
|-----|-----------|-------|---------------|
| 0-50 | Good | 🟢 Verde | Calidad del aire satisfactoria. Actividades al aire libre recomendadas. |
| 51-100 | Moderate | 🟡 Amarillo | Aceptable. Personas muy sensibles deben considerar limitar actividades prolongadas. |
| 101-150 | Unhealthy for Sensitive | 🟠 Naranja | Personas con problemas respiratorios deben limitar actividades. |
| 151-200 | Unhealthy | 🔴 Rojo | Todos deben reducir actividad física. Personas sensibles evitar salir. |
| 201-300 | Very Unhealthy | 🟣 Púrpura | Alerta de salud. Evitar actividades al aire libre. |
| 301-500 | Hazardous | 🟤 Marrón | Emergencia. Quedarse en interiores con ventanas cerradas. |

---

## 🚀 Cómo Usar

### 1. Iniciar el Servidor

```bash
# Instalar dependencias
npm install

# Iniciar PostgreSQL
docker-compose up -d

# Ejecutar migraciones
npx prisma db push

# Iniciar servidor NestJS
npm run start:dev
```

### 2. Probar Endpoints

Usa el archivo `air-quality-test.http` con la extensión REST Client de VS Code:

```http
### Zonas peligrosas
GET http://localhost:4000/air-quality/dangerous-zones

### Datos para mapa
GET http://localhost:4000/air-quality/map-data?hours=6

### Recomendación para Ciudad de México
GET http://localhost:4000/air-quality/health-advice?lat=19.4326&lon=-99.1332
```

### 3. Procesar Datos de OpenAQ

```typescript
import { AirQualityProcessorService } from './shared/services/air-quality-processor.service';

// En tu servicio de OpenAQ
const rawData = await this.fetchFromOpenAQ();
const result = await this.airQualityService.processOpenAQMeasurements(rawData);

console.log(`✅ Guardadas: ${result.saved} mediciones`);
```

---

## 🗺️ Coordenadas de Ciudades Importantes

```javascript
const cities = {
  // Estados Unidos
  'New York': { lat: 40.7128, lon: -74.0060 },
  'Los Angeles': { lat: 34.0522, lon: -118.2437 },
  'Chicago': { lat: 41.8781, lon: -87.6298 },
  'Houston': { lat: 29.7604, lon: -95.3698 },
  
  // México
  'Ciudad de México': { lat: 19.4326, lon: -99.1332 },
  'Monterrey': { lat: 25.6866, lon: -100.3161 },
  'Guadalajara': { lat: 20.6597, lon: -103.3496 },
  
  // Canadá
  'Toronto': { lat: 43.6532, lon: -79.3832 },
  'Vancouver': { lat: 49.2827, lon: -123.1207 },
  'Montreal': { lat: 45.5017, lon: -73.5673 },
};
```

---

## 📚 Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `AIR_QUALITY_GUIDE.md` | Guía detallada de interpretación de AQI |
| `AIR_QUALITY_API_USAGE.md` | Ejemplos de uso de la API |
| `air-quality-test.http` | Pruebas de endpoints |
| `src/shared/utils/aqi-calculator.ts` | Calculadora AQI |
| `src/shared/services/air-quality-processor.service.ts` | Procesador principal |
| `src/air-quality/air-quality.controller.ts` | Controlador REST |
| `prisma/schema.prisma` | Esquema de base de datos |

---

## 🎨 Colores para Visualización

```typescript
const categoryColors = {
  'Good': '#00E400',                           // Verde
  'Moderate': '#FFFF00',                       // Amarillo
  'Unhealthy for Sensitive Groups': '#FF7E00', // Naranja
  'Unhealthy': '#FF0000',                      // Rojo
  'Very Unhealthy': '#8F3F97',                 // Púrpura
  'Hazardous': '#7E0023'                       // Marrón
};
```

---

## ✅ Estado del Proyecto

- ✅ Base de datos PostgreSQL configurada (puerto 5433)
- ✅ Modelos Prisma para TEMPO y OpenAQ
- ✅ Calculadora AQI con estándar EPA
- ✅ Servicio de procesamiento de datos
- ✅ 3 endpoints REST funcionales
- ✅ Filtrado geográfico de Norteamérica
- ✅ Recomendaciones de salud en español
- ✅ Documentación completa

## 🔜 Próximos Pasos

1. Integrar datos de NASA TEMPO (satélite)
2. Crear tarea programada para actualizar datos automáticamente
3. Implementar caché para mejorar rendimiento
4. Agregar WebSockets para alertas en tiempo real
5. Desarrollar frontend con React/Next.js

---

## 📞 Soporte

Para más información consulta:
- `AIR_QUALITY_GUIDE.md` - Interpretación de datos
- `AIR_QUALITY_API_USAGE.md` - Ejemplos de uso
- `ENDPOINTS_SUMMARY.md` - Resumen de endpoints

