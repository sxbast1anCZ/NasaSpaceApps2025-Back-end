# TEMPO Module - NASA Earth Data Integration

## Descripción

Este módulo procesa e almacena datos de mediciones atmosféricas de TEMPO (Tropospheric Emissions: Monitoring of Pollution) de la NASA. Está optimizado para manejar grandes volúmenes de datos con máxima eficiencia.

## Características

### ✨ Optimizaciones de Rendimiento

- **Bulk Inserts**: Inserción en lotes usando `createMany()` de Prisma
- **Procesamiento por Lotes**: Divide grandes conjuntos de datos en lotes de 5,000 mediciones
- **Índices de Base de Datos**: Índices compuestos optimizados para búsquedas frecuentes:
  - `[timestamp, pollutant]` - Búsqueda por fecha y tipo de contaminante
  - `[latitude, longitude, timestamp]` - Búsquedas geoespaciales temporales
  - `[pollutant, aqi_category]` - Filtrado por calidad del aire
- **Skip Duplicates**: Evita errores en inserciones duplicadas
- **Transacciones**: Garantiza integridad de datos

### 📊 Datos Almacenados

- **Ubicación**: Latitud y Longitud
- **Timestamp**: Fecha y hora exacta de la medición (crítico para predicciones en tiempo real)
- **Contaminante**: Tipo de gas (O3, NO2)
- **Concentración**: Concentración troposférica en ppb
- **Columna Vertical**: Medición en Unidades Dobson (DU)
- **AQI**: Índice de Calidad del Aire (0-500)
- **Categoría AQI**: Clasificación (Bueno, Moderado, etc.)
- **Quality Flag**: Bandera de calidad de datos

## Endpoints

### POST /tempo/ingest

Ingesta datos TEMPO desde JSON procesado por el script Python.

**Body:**
```json
{
  "measurements": [
    {
      "latitude": 17.299999,
      "longitude": -93.110001,
      "timestamp": "2025-10-04T21:31:03Z",
      "pollutant": "O3",
      "tropospheric_concentration_ppb": 10.46,
      "vertical_column_du": 261.4039,
      "aqi": 10,
      "aqi_category": "Bueno",
      "quality_flag": 1.0
    }
  ]
}
```

**Respuesta:**
```json
{
  "totalProcessed": 45678,
  "totalDuration": 2345,
  "batchesProcessed": 10,
  "rate": "19.47 mediciones/ms"
}
```

### GET /tempo/measurements

Obtiene mediciones filtradas por contaminante y rango de fechas.

**Query Parameters:**
- `pollutant` (opcional): "O3" o "NO2"
- `startDate` (opcional): Fecha inicio en formato ISO 8601
- `endDate` (opcional): Fecha fin en formato ISO 8601
- `limit` (opcional): Límite de resultados (default: 1000)

**Ejemplo:**
```
GET /tempo/measurements?pollutant=O3&startDate=2025-10-04T00:00:00Z&limit=100
```

### GET /tempo/measurements/location

Obtiene mediciones cercanas a una ubicación geográfica.

**Query Parameters:**
- `latitude` (requerido): Latitud
- `longitude` (requerido): Longitud
- `radius` (opcional): Radio de búsqueda en grados (default: 0.5 ≈ 55km)
- `pollutant` (opcional): "O3" o "NO2"

**Ejemplo:**
```
GET /tempo/measurements/location?latitude=17.3&longitude=-93.11&radius=1&pollutant=O3
```

## Schema de Base de Datos

```prisma
model TempoMeasurement {
  id                              BigInt   @id @default(autoincrement())
  latitude                        Float
  longitude                       Float
  timestamp                       DateTime
  pollutant                       String   @db.VarChar(10)
  tropospheric_concentration_ppb  Float
  vertical_column_du              Float
  aqi                             Int
  aqi_category                    String   @db.VarChar(20)
  quality_flag                    Float
  createdAt                       DateTime @default(now())

  @@index([timestamp, pollutant])
  @@index([latitude, longitude, timestamp])
  @@index([pollutant, aqi_category])
  @@map("tempo_measurements")
}
```

## Flujo de Trabajo

1. **Script Python** convierte archivos NC de TEMPO a JSON
2. **Google Cloud** enviará los JSON a este endpoint (próximamente)
3. **API** procesa los JSON en lotes optimizados
4. **Base de Datos** almacena las mediciones con índices para búsquedas rápidas
5. **Consultas** permiten análisis en tiempo real por ubicación, fecha y contaminante

## Próximos Pasos

- [ ] Integración con Google Cloud Functions
- [ ] Endpoints de estadísticas y agregaciones
- [ ] Sistema de cache para consultas frecuentes
- [ ] Webhooks para notificaciones en tiempo real
- [ ] API de predicciones basada en datos históricos

## Rendimiento Esperado

Con las optimizaciones actuales:
- **Inserción**: ~20-50 mediciones/ms (dependiendo del hardware)
- **Consultas por fecha**: < 100ms con índices
- **Consultas geoespaciales**: < 200ms con índices
- **Capacidad**: Millones de mediciones sin degradación significativa
