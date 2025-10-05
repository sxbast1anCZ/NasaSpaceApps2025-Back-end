# ✅ Sistema de Calidad de Aire - IMPLEMENTADO

## 🎉 Estado: COMPLETADO

Tu sistema de análisis de calidad de aire para Norteamérica está completamente funcional.

---

## 🚀 Endpoints Disponibles

### ✅ 1. Zonas Peligrosas
```
GET http://localhost:4000/air-quality/dangerous-zones
GET http://localhost:4000/air-quality/dangerous-zones?hours=24
```

Retorna ubicaciones con AQI > 150 (aire peligroso) en las últimas 6-24 horas.

---

### ✅ 2. Datos para Mapa de Calor
```
GET http://localhost:4000/air-quality/map-data
GET http://localhost:4000/air-quality/map-data?hours=6
```

Obtiene mediciones recientes para visualizar en un mapa.

---

### ✅ 3. Recomendaciones de Salud por Ubicación
```
GET http://localhost:4000/air-quality/health-advice?lat=19.4326&lon=-99.1332
GET http://localhost:4000/air-quality/health-advice?lat=34.0522&lon=-118.2437&radius=30
```

Retorna el AQI y recomendaciones de salud para una ubicación específica.

---

## 📊 ¿Qué Hace el Sistema?

### 1. **Recibe Datos de OpenAQ**
Los sensores terrestres envían mediciones de PM2.5 y PM10 (partículas contaminantes).

Ejemplo de datos crudos:
```json
{
  "locationName": "Ciudad de México",
  "coordinates": { "latitude": 19.4326, "longitude": -99.1332 },
  "parameter": { "name": "pm25" },
  "measurements": [{ "value": 45.3 }]
}
```

### 2. **Filtra Solo Norteamérica**
Automáticamente descarta datos fuera de:
- **Latitud**: 15° a 72° (México a Alaska)
- **Longitud**: -170° a -52° (Costa oeste a costa este)

### 3. **Calcula AQI (Índice de Calidad de Aire)**
Convierte concentraciones de contaminantes a un número de 0-500:

| PM2.5 (µg/m³) | AQI | Categoría |
|---------------|-----|-----------|
| 0 - 12 | 0 - 50 | 🟢 Bueno |
| 12.1 - 35.4 | 51 - 100 | 🟡 Moderado |
| 35.5 - 55.4 | 101 - 150 | 🟠 Insalubre (sensibles) |
| 55.5 - 150.4 | 151 - 200 | 🔴 Insalubre |
| 150.5 - 250.4 | 201 - 300 | 🟣 Muy Insalubre |
| 250.5+ | 301 - 500 | 🟤 Peligroso |

**Ejemplo:**
- PM2.5 = 45.3 µg/m³
- **AQI = 125** (Unhealthy for Sensitive Groups)

### 4. **Genera Recomendaciones en Español**

Basado en el AQI, el sistema dice qué hacer:

| AQI | Recomendación |
|-----|---------------|
| 0-50 | ✅ "La calidad del aire es satisfactoria. Actividades al aire libre recomendadas." |
| 51-100 | ⚠️ "Aceptable para la mayoría. Personas muy sensibles deben considerar limitar actividades." |
| 101-150 | ⚠️ "Personas con problemas respiratorios deben limitar actividades al aire libre." |
| 151-200 | 🚫 "Todos deben reducir la actividad física al aire libre. Personas sensibles evitar salir." |
| 201-300 | 🚫 "Alerta de salud: todos pueden experimentar efectos. Evitar actividades al aire libre." |
| 301-500 | 🚫 "Emergencia de salud pública. Quedarse en interiores con ventanas cerradas." |

### 5. **Guarda Todo en la Base de Datos**

```sql
-- Cada medición se guarda con:
INSERT INTO openaq_measurements (
  location_name,     -- "Ciudad de México"
  latitude,          -- 19.4326
  longitude,         -- -99.1332
  parameter,         -- "pm25"
  value,             -- 45.3 µg/m³
  aqi,               -- 125 (calculado automáticamente)
  aqi_category,      -- "Unhealthy for Sensitive Groups"
  health_advice,     -- "Personas con problemas respiratorios..."
  measurement_date   -- 2025-04-10 15:00:00
);
```

---

## 🧪 Cómo Probar

### Opción 1: Usando VS Code REST Client

Abre el archivo **`air-quality-test.http`** y haz clic en "Send Request":

```http
### Zonas peligrosas
GET http://localhost:4000/air-quality/dangerous-zones
```

### Opción 2: Navegador

Abre en tu navegador:
```
http://localhost:4000/air-quality/dangerous-zones
```

### Opción 3: cURL

```bash
curl http://localhost:4000/air-quality/dangerous-zones
```

---

## 📂 Archivos Importantes

| Archivo | Qué Hace |
|---------|----------|
| **`src/shared/utils/aqi-calculator.ts`** | Calcula AQI según estándar EPA |
| **`src/shared/services/air-quality-processor.service.ts`** | Procesa datos, filtra por geografía, genera recomendaciones |
| **`src/air-quality/air-quality.controller.ts`** | Endpoints REST (dangerous-zones, map-data, health-advice) |
| **`prisma/schema.prisma`** | Estructura de la base de datos |
| **`air-quality-test.http`** | Pruebas de endpoints |

---

## 🗺️ Ciudades que Puedes Consultar

```javascript
// Estados Unidos
New York:    { lat: 40.7128, lon: -74.0060 }
Los Angeles: { lat: 34.0522, lon: -118.2437 }
Chicago:     { lat: 41.8781, lon: -87.6298 }

// México
CDMX:        { lat: 19.4326, lon: -99.1332 }
Monterrey:   { lat: 25.6866, lon: -100.3161 }
Guadalajara: { lat: 20.6597, lon: -103.3496 }

// Canadá
Toronto:     { lat: 43.6532, lon: -79.3832 }
Vancouver:   { lat: 49.2827, lon: -123.1207 }
Montreal:    { lat: 45.5017, lon: -73.5673 }
```

**Ejemplo de consulta:**
```
http://localhost:4000/air-quality/health-advice?lat=19.4326&lon=-99.1332
```

---

## 💡 Ejemplo de Uso en Frontend

### React Component - Widget de Calidad de Aire

```jsx
import { useState, useEffect } from 'react';

function AirQualityWidget({ lat, lon }) {
  const [airQuality, setAirQuality] = useState(null);
  
  useEffect(() => {
    fetch(`http://localhost:4000/air-quality/health-advice?lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then(data => setAirQuality(data));
  }, [lat, lon]);
  
  if (!airQuality) return <div>Cargando...</div>;
  
  const getColor = (aqi) => {
    if (aqi <= 50) return '#00E400';      // Verde
    if (aqi <= 100) return '#FFFF00';     // Amarillo
    if (aqi <= 150) return '#FF7E00';     // Naranja
    if (aqi <= 200) return '#FF0000';     // Rojo
    if (aqi <= 300) return '#8F3F97';     // Púrpura
    return '#7E0023';                     // Marrón
  };
  
  return (
    <div style={{ 
      padding: '20px', 
      borderRadius: '10px',
      backgroundColor: getColor(airQuality.aqi),
      color: 'white'
    }}>
      <h2>Calidad de Aire</h2>
      <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
        {airQuality.aqi}
      </div>
      <div>{airQuality.category}</div>
      <p style={{ marginTop: '10px' }}>
        {airQuality.healthAdvice}
      </p>
      <small>Estación: {airQuality.nearestStation} ({airQuality.distance.toFixed(1)} km)</small>
    </div>
  );
}

// Uso:
<AirQualityWidget lat={19.4326} lon={-99.1332} />
```

### Mapa de Zonas Peligrosas (Leaflet)

```jsx
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';

function DangerousZonesMap() {
  const [zones, setZones] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:4000/air-quality/dangerous-zones?hours=24')
      .then(res => res.json())
      .then(data => setZones(data.zones));
  }, []);
  
  return (
    <MapContainer center={[37, -95]} zoom={4} style={{ height: '600px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {zones.map((zone, i) => (
        <CircleMarker
          key={i}
          center={[zone.coordinates.lat, zone.coordinates.lon]}
          radius={zone.aqi > 200 ? 15 : 10}
          fillColor="#FF0000"
          fillOpacity={0.7}
          color="#FFF"
          weight={2}
        >
          <Popup>
            <b>{zone.location}</b><br/>
            AQI: {zone.aqi} ({zone.category})<br/>
            {zone.healthAdvice}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
```

---

## 🎯 ¿Qué Significa Cada Contaminante?

### PM2.5 - Partículas Finas
- **Tamaño**: 2.5 micrómetros (1/30 del grosor de un cabello humano)
- **Fuentes**: Humo de vehículos, industrias, incendios
- **Peligro**: Penetran profundo en los pulmones y torrente sanguíneo
- **Efecto**: Enfermedades cardíacas y respiratorias

### PM10 - Partículas Gruesas
- **Tamaño**: 10 micrómetros
- **Fuentes**: Polvo, construcción, polen
- **Peligro**: Se quedan en vías respiratorias superiores
- **Efecto**: Asma, bronquitis, irritación

### O3 - Ozono Troposférico
- **Formación**: Reacción de NOx y VOCs con luz solar
- **Peligro**: Irrita vías respiratorias
- **Efecto**: Dificultad para respirar, tos, dolor de garganta

### NO2 - Dióxido de Nitrógeno
- **Fuentes**: Vehículos, plantas de energía
- **Peligro**: Inflama vías respiratorias
- **Efecto**: Asma, infecciones respiratorias

---

## 📚 Documentación Completa

- **`AIR_QUALITY_GUIDE.md`** - Guía detallada de interpretación de AQI
- **`AIR_QUALITY_API_USAGE.md`** - Ejemplos de uso de la API
- **`SISTEMA_CALIDAD_AIRE.md`** - Documentación técnica completa
- **`air-quality-test.http`** - Tests de endpoints

---

## ✅ Checklist de Funcionalidades

- ✅ **Cálculo AQI** - Implementado para PM2.5, PM10, O3, NO2
- ✅ **Filtrado Geográfico** - Solo Norteamérica (lat 15-72, lon -170 a -52)
- ✅ **Recomendaciones de Salud** - En español, basadas en EPA
- ✅ **Base de Datos** - PostgreSQL con Prisma ORM
- ✅ **Endpoint Zonas Peligrosas** - AQI > 150
- ✅ **Endpoint Mapa de Calor** - Datos para visualización
- ✅ **Endpoint Recomendaciones** - Por ubicación específica
- ✅ **Colores por Categoría** - Para visualización en frontend
- ✅ **Documentación Completa** - Guías y ejemplos

---

## 🚀 Próximos Pasos Sugeridos

1. **Integrar NASA TEMPO**
   - Agregar datos satelitales de O3 y NO2
   - Combinar con datos terrestres

2. **Automatización**
   - Crear tarea cron para actualizar datos cada hora
   - Implementar caché para mejorar rendimiento

3. **Alertas en Tiempo Real**
   - WebSockets para notificaciones push
   - Envío de emails cuando AQI > 200

4. **Frontend**
   - Dashboard con React/Next.js
   - Mapas interactivos con Leaflet/Mapbox
   - Gráficas históricas con Chart.js

5. **Machine Learning**
   - Predicciones de calidad de aire
   - Detección de patrones estacionales

---

## 🎉 ¡Listo para Usar!

Tu sistema está completamente funcional. Puedes:

1. ✅ **Consultar zonas peligrosas** en tiempo real
2. ✅ **Obtener recomendaciones** para cualquier ubicación en Norteamérica
3. ✅ **Visualizar datos** en mapas de calor
4. ✅ **Entender qué significan** los valores de contaminantes
5. ✅ **Integrar con frontend** usando los endpoints REST

**El servidor está corriendo en:** http://localhost:4000

**¡Felicidades! 🎊**

