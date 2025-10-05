# API de Calidad de Aire - Guía de Uso

## Endpoints Disponibles

### 1. **GET /air-quality/dangerous-zones**
Obtiene zonas con calidad de aire peligrosa (AQI > 150)

**Query Parameters:**
- `hours` (opcional): Horas hacia atrás para buscar. Default: 6

**Ejemplo de uso:**
```bash
curl http://localhost:4000/air-quality/dangerous-zones
curl http://localhost:4000/air-quality/dangerous-zones?hours=24
```

**Respuesta:**
```json
{
  "timestamp": "2025-04-10T15:30:00.000Z",
  "hoursBack": 6,
  "count": 3,
  "zones": [
    {
      "location": "Ciudad de México",
      "country": "Mexico",
      "coordinates": {
        "lat": 19.4326,
        "lon": -99.1332
      },
      "pollutant": "pm25",
      "concentration": 75.5,
      "aqi": 162,
      "category": "Unhealthy",
      "healthAdvice": "Todos deben reducir la actividad física al aire libre, especialmente personas sensibles",
      "lastUpdate": "2025-04-10T15:00:00.000Z",
      "severity": "ALTO"
    }
  ]
}
```

---

### 2. **GET /air-quality/map-data**
Obtiene datos para crear mapa de calor

**Query Parameters:**
- `hours` (opcional): Horas hacia atrás para buscar. Default: 12

**Ejemplo de uso:**
```bash
curl http://localhost:4000/air-quality/map-data
curl http://localhost:4000/air-quality/map-data?hours=6
```

**Respuesta:**
```json
{
  "timestamp": "2025-04-10T15:30:00.000Z",
  "hoursBack": 12,
  "count": 150,
  "measurements": [
    {
      "location": "Los Angeles",
      "country": "United States",
      "coordinates": {
        "lat": 34.0522,
        "lon": -118.2437
      },
      "pollutant": "pm25",
      "concentration": 35.2,
      "aqi": 100,
      "category": "Moderate",
      "lastUpdate": "2025-04-10T15:00:00.000Z"
    }
  ]
}
```

---

### 3. **GET /air-quality/health-advice**
Obtiene recomendaciones de salud para una ubicación específica

**Query Parameters:**
- `lat` (requerido): Latitud
- `lon` (requerido): Longitud
- `radius` (opcional): Radio de búsqueda en km. Default: 50

**Ejemplo de uso:**
```bash
# Ciudad de México
curl "http://localhost:4000/air-quality/health-advice?lat=19.4326&lon=-99.1332&radius=50"

# Los Angeles
curl "http://localhost:4000/air-quality/health-advice?lat=34.0522&lon=-118.2437"
```

**Respuesta:**
```json
{
  "location": {
    "lat": 19.4326,
    "lon": -99.1332
  },
  "nearestStation": "Ciudad de México Centro",
  "distance": 5.2,
  "aqi": 125,
  "category": "Unhealthy for Sensitive Groups",
  "healthAdvice": "Personas con problemas respiratorios deben limitar actividades al aire libre",
  "pollutants": [
    {
      "type": "pm25",
      "value": 45.3,
      "aqi": 125
    },
    {
      "type": "pm10",
      "value": 78.1,
      "aqi": 87
    }
  ],
  "lastUpdate": "2025-04-10T15:00:00.000Z"
}
```

---

## Procesamiento de Datos OpenAQ

### Uso del servicio de procesamiento

El servicio `AirQualityProcessorService` se encarga de:

1. **Filtrar datos de Norteamérica** (lat: 15-72, lon: -170 a -52)
2. **Calcular AQI** automáticamente para PM2.5 y PM10
3. **Generar recomendaciones de salud** en español
4. **Guardar en la base de datos** con toda la información procesada

**Ejemplo de uso en código:**

```typescript
import { AirQualityProcessorService } from './shared/services/air-quality-processor.service';

// Procesar datos de OpenAQ
const rawData = await fetch('https://api.openaq.org/v3/sensors');
const result = await airQualityService.processOpenAQMeasurements(rawData);

console.log(`Procesadas: ${result.processed}`);
console.log(`Guardadas: ${result.saved}`);
console.log(`Errores: ${result.errors}`);
```

---

## Niveles de AQI

| Rango AQI | Categoría | Color | Severidad |
|-----------|-----------|-------|-----------|
| 0-50 | Good | Verde (#00E400) | - |
| 51-100 | Moderate | Amarillo (#FFFF00) | - |
| 101-150 | Unhealthy for Sensitive Groups | Naranja (#FF7E00) | - |
| 151-200 | Unhealthy | Rojo (#FF0000) | ALTO |
| 201-300 | Very Unhealthy | Púrpura (#8F3F97) | MUY_ALTO |
| 301-500 | Hazardous | Marrón (#7E0023) | EXTREMO |

---

## Recomendaciones por Categoría

### 🟢 Good (0-50)
- ✅ La calidad del aire es satisfactoria
- ✅ Actividades al aire libre recomendadas

### 🟡 Moderate (51-100)
- ⚠️ Aceptable para la mayoría
- ⚠️ Personas muy sensibles deben considerar limitar actividades prolongadas

### 🟠 Unhealthy for Sensitive Groups (101-150)
- ⚠️ Personas con problemas respiratorios deben limitar actividades al aire libre
- ⚠️ Niños y adultos mayores deben reducir ejercicio intenso

### 🔴 Unhealthy (151-200)
- 🚫 Todos deben reducir la actividad física al aire libre
- 🚫 Personas sensibles deben evitar salir

### 🟣 Very Unhealthy (201-300)
- 🚫 Alerta de salud: todos pueden experimentar efectos
- 🚫 Evitar actividades al aire libre

### 🟤 Hazardous (301-500)
- 🚫 Emergencia de salud pública
- 🚫 Quedarse en interiores con ventanas cerradas

---

## Ejemplos de Uso en Frontend

### Mapa de Calor (Leaflet/Mapbox)

```javascript
// Obtener datos
const response = await fetch('http://localhost:4000/air-quality/map-data?hours=12');
const data = await response.json();

// Crear marcadores en el mapa
data.measurements.forEach(point => {
  const color = getColorByCategory(point.category);
  
  L.circleMarker([point.coordinates.lat, point.coordinates.lon], {
    radius: 8,
    fillColor: color,
    fillOpacity: 0.7,
    color: '#fff',
    weight: 2
  })
  .bindPopup(`
    <b>${point.location}</b><br>
    AQI: ${point.aqi} (${point.category})<br>
    ${point.pollutant}: ${point.concentration}
  `)
  .addTo(map);
});
```

### Alertas de Zonas Peligrosas

```javascript
async function checkDangerousZones() {
  const response = await fetch('http://localhost:4000/air-quality/dangerous-zones?hours=6');
  const data = await response.json();
  
  if (data.count > 0) {
    showAlert(`⚠️ ${data.count} zonas con aire peligroso detectadas`);
    
    data.zones.forEach(zone => {
      if (zone.severity === 'EXTREMO') {
        showUrgentAlert(zone);
      }
    });
  }
}
```

### Widget de Calidad de Aire Local

```javascript
async function getLocalAirQuality(lat, lon) {
  const response = await fetch(
    `http://localhost:4000/air-quality/health-advice?lat=${lat}&lon=${lon}&radius=25`
  );
  const data = await response.json();
  
  document.getElementById('aqi-value').textContent = data.aqi;
  document.getElementById('aqi-category').textContent = data.category;
  document.getElementById('health-advice').textContent = data.healthAdvice;
  document.getElementById('aqi-badge').style.backgroundColor = getColorByCategory(data.category);
}
```

---

## Coordenadas de Ciudades Importantes en Norteamérica

```javascript
const cities = {
  // Estados Unidos
  'New York': { lat: 40.7128, lon: -74.0060 },
  'Los Angeles': { lat: 34.0522, lon: -118.2437 },
  'Chicago': { lat: 41.8781, lon: -87.6298 },
  'Houston': { lat: 29.7604, lon: -95.3698 },
  'Phoenix': { lat: 33.4484, lon: -112.0740 },
  
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

## Notas Importantes

1. **Datos en tiempo real**: Las mediciones se actualizan cada hora desde OpenAQ
2. **Filtrado geográfico**: Solo se procesan datos de Norteamérica (lat 15-72, lon -170 a -52)
3. **Mediciones recientes**: Por defecto se muestran datos de las últimas 6-12 horas
4. **Cálculo AQI**: Se usa el estándar EPA de Estados Unidos
5. **Idioma**: Todas las recomendaciones de salud están en español

