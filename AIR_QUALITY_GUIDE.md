# 📊 Guía de Interpretación de Datos de Calidad del Aire

## 🎯 Índice de Calidad del Aire (AQI)

El **AQI (Air Quality Index)** es el estándar internacional para medir qué tan peligroso es el aire. Va de 0 a 500.

### Categorías de AQI:

| AQI | Categoría | Color | Significado | Recomendación |
|-----|-----------|-------|-------------|---------------|
| **0-50** | **Bueno** (Good) | 🟢 Verde | Calidad del aire satisfactoria | Actividades normales |
| **51-100** | **Moderado** (Moderate) | 🟡 Amarillo | Aceptable, pero personas sensibles pueden tener problemas | Sensibles: reducir actividad prolongada al aire libre |
| **101-150** | **Dañino para grupos sensibles** (Unhealthy for Sensitive Groups) | 🟠 Naranja | Grupos sensibles experimentan efectos | Sensibles: evitar actividad prolongada al aire libre |
| **151-200** | **Dañino** (Unhealthy) | 🔴 Rojo | Todos pueden experimentar efectos | Todos: limitar actividad prolongada al aire libre |
| **201-300** | **Muy dañino** (Very Unhealthy) | 🟣 Púrpura | Alerta de salud: todos experimentan efectos graves | Todos: evitar actividad al aire libre |
| **301-500** | **Peligroso** (Hazardous) | 🟤 Marrón | Emergencia de salud | Todos: permanecer en interiores |

---

## 🌫️ Contaminantes Principales

### 1. **PM (Particulate Matter) - Material Particulado**

**De OpenAQ (sensores terrestres):**

- **PM2.5**: Partículas ≤ 2.5 micrómetros
  - Las más peligrosas (entran en pulmones y sangre)
  - Unidad: µg/m³ (microgramos por metro cúbico)
  
- **PM10**: Partículas ≤ 10 micrómetros
  - Peligrosas pero más grandes
  - Unidad: µg/m³

#### Cálculo de AQI para PM2.5:

| PM2.5 (µg/m³) | AQI | Categoría |
|---------------|-----|-----------|
| 0.0 - 12.0 | 0-50 | Bueno |
| 12.1 - 35.4 | 51-100 | Moderado |
| 35.5 - 55.4 | 101-150 | Dañino sensibles |
| 55.5 - 150.4 | 151-200 | Dañino |
| 150.5 - 250.4 | 201-300 | Muy dañino |
| 250.5+ | 301-500 | Peligroso |

#### Cálculo de AQI para PM10:

| PM10 (µg/m³) | AQI | Categoría |
|--------------|-----|-----------|
| 0 - 54 | 0-50 | Bueno |
| 55 - 154 | 51-100 | Moderado |
| 155 - 254 | 101-150 | Dañino sensibles |
| 255 - 354 | 151-200 | Dañino |
| 355 - 424 | 201-300 | Muy dañino |
| 425+ | 301-500 | Peligroso |

---

### 2. **O3 (Ozono troposférico)**

**De TEMPO (satélite NASA):**

- Ozono a nivel del suelo (no el bueno de la estratosfera)
- Causa problemas respiratorios
- Unidad: ppb (partes por billón)

#### Cálculo de AQI para O3:

| O3 (ppb) 8h | AQI | Categoría |
|-------------|-----|-----------|
| 0 - 54 | 0-50 | Bueno |
| 55 - 70 | 51-100 | Moderado |
| 71 - 85 | 101-150 | Dañino sensibles |
| 86 - 105 | 151-200 | Dañino |
| 106 - 200 | 201-300 | Muy dañino |

---

### 3. **NO2 (Dióxido de Nitrógeno)**

**De TEMPO (satélite NASA):**

- Producido por vehículos y plantas de energía
- Causa inflamación de vías respiratorias
- Unidad: ppb (partes por billón)

#### Cálculo de AQI para NO2:

| NO2 (ppb) 1h | AQI | Categoría |
|--------------|-----|-----------|
| 0 - 53 | 0-50 | Bueno |
| 54 - 100 | 51-100 | Moderado |
| 101 - 360 | 101-150 | Dañino sensibles |
| 361 - 649 | 151-200 | Dañino |
| 650+ | 201-300 | Muy dañino |

---

## 🗺️ Filtrado para Norteamérica

### Coordenadas de Norteamérica:

```javascript
const NORTH_AMERICA_BOUNDS = {
  minLat: 15,      // Sur de México
  maxLat: 72,      // Norte de Canadá/Alaska
  minLon: -170,    // Alaska Oeste
  maxLon: -52      // Este de Canadá
};
```

### Países principales:
- 🇺🇸 **Estados Unidos**
- 🇨🇦 **Canadá**
- 🇲🇽 **México**

---

## 💾 Estructura de Datos en la BD

### Tabla: `openaq_measurements`

```sql
id                  BIGINT       (ID único)
sensorId            INT          (ID del sensor de OpenAQ)
locationId          INT          (ID de ubicación)
locationName        VARCHAR(255) (Nombre del lugar, ej: "New York City Hall")
country             VARCHAR(100) (País)
latitude            FLOAT        (Coordenada)
longitude           FLOAT        (Coordenada)
parameter           VARCHAR(10)  ("pm10" o "pm25")
value               FLOAT        (Valor en µg/m³)
units               VARCHAR(20)  ("µg/m³")
measurementDate     DATETIME     (Fecha/hora UTC de la medición)
aqi                 INT          (AQI calculado 0-500)
aqiCategory         VARCHAR(50)  ("Good", "Moderate", "Unhealthy", etc.)
healthAdvice        TEXT         (Recomendación de salud)
createdAt           DATETIME     (Cuando se insertó en la BD)
```

### Tabla: `tempo_measurements`

```sql
id                              BIGINT   (ID único)
latitude                        FLOAT    (Coordenada)
longitude                       FLOAT    (Coordenada)
timestamp                       DATETIME (Fecha/hora de medición)
pollutant                       VARCHAR  ("O3" o "NO2")
tropospheric_concentration_ppb  FLOAT    (Concentración en ppb)
vertical_column_du              FLOAT    (Columna vertical en Dobson Units)
aqi                             INT      (AQI calculado)
aqi_category                    VARCHAR  ("Good", "Moderate", etc.)
quality_flag                    FLOAT    (Flag de calidad del dato)
createdAt                       DATETIME (Cuando se insertó)
```

---

## 🎨 Visualización para el Front-End

### Mapa de Calor (Heatmap):

```javascript
// Colores por categoría AQI
const AQI_COLORS = {
  'Good': '#00E400',              // Verde
  'Moderate': '#FFFF00',          // Amarillo
  'Unhealthy for Sensitive Groups': '#FF7E00',  // Naranja
  'Unhealthy': '#FF0000',         // Rojo
  'Very Unhealthy': '#8F3F97',    // Púrpura
  'Hazardous': '#7E0023'          // Marrón
};
```

### Recomendaciones de Salud:

```javascript
const HEALTH_ADVICE = {
  'Good': 'La calidad del aire es satisfactoria. Disfruta tus actividades al aire libre.',
  'Moderate': 'Personas inusualmente sensibles deberían considerar reducir actividades prolongadas al aire libre.',
  'Unhealthy for Sensitive Groups': 'Niños, ancianos y personas con problemas respiratorios deberían limitar actividades prolongadas al aire libre.',
  'Unhealthy': 'Todos pueden experimentar efectos en la salud. Evita actividades prolongadas al aire libre.',
  'Very Unhealthy': 'Alerta de salud. Todos pueden experimentar efectos graves. Permanece en interiores.',
  'Hazardous': '🚨 EMERGENCIA. Todos deben permanecer en interiores con ventanas cerradas.'
};
```

---

## 📊 Queries Útiles para el Front-End

### 1. Obtener mediciones recientes de Norteamérica:

```typescript
const recentMeasurements = await prisma.openAQMeasurement.findMany({
  where: {
    latitude: { gte: 15, lte: 72 },
    longitude: { gte: -170, lte: -52 },
    measurementDate: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
    }
  },
  orderBy: { measurementDate: 'desc' },
  take: 100
});
```

### 2. Obtener zonas peligrosas (AQI > 150):

```typescript
const dangerousAreas = await prisma.openAQMeasurement.findMany({
  where: {
    aqi: { gte: 151 },
    measurementDate: {
      gte: new Date(Date.now() - 6 * 60 * 60 * 1000) // Últimas 6h
    }
  },
  select: {
    locationName,
    latitude,
    longitude,
    aqi,
    aqiCategory,
    healthAdvice,
    measurementDate
  }
});
```

### 3. Comparar satélite (TEMPO) vs sensores (OpenAQ):

```typescript
// Obtener datos cercanos en tiempo y espacio
const correlation = await prisma.$queryRaw`
  SELECT 
    t.pollutant,
    t.latitude,
    t.longitude,
    t.aqi as tempo_aqi,
    o.aqi as openaq_aqi,
    o.locationName
  FROM tempo_measurements t
  JOIN openaq_measurements o ON (
    ABS(t.latitude - o.latitude) < 0.5 AND
    ABS(t.longitude - o.longitude) < 0.5 AND
    ABS(EXTRACT(EPOCH FROM (t.timestamp - o.measurementDate))) < 3600
  )
  WHERE t.timestamp > NOW() - INTERVAL '24 hours'
  LIMIT 100
`;
```

---

## 🚀 Próximos Pasos

1. **Filtrar datos de OpenAQ** para solo Norteamérica
2. **Calcular AQI** automáticamente al insertar datos
3. **Agregar campo `healthAdvice`** con recomendaciones
4. **Crear endpoint** que devuelva zonas peligrosas
5. **Implementar sistema de alertas** cuando AQI > 150

¿Quieres que implemente alguno de estos puntos? 🎯
