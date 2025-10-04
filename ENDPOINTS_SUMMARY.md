# 📊 Resumen de Endpoints - NASA Space Apps Challenge

## 🎯 **Objetivo del Desafío:**
Monitorear la calidad del aire usando datos satelitales y terrestres, comparando mediciones y visualizando contaminantes en tiempo real.

---

## 🔥 **Endpoints CRÍTICOS para el Desafío NASA**

### 1. **Contaminación del Aire (OpenWeather)** ⭐⭐⭐⭐⭐
```http
GET /openweather/air-pollution?lat=19.4326&lon=-99.1332
```

**¿Qué hace?**
- Obtiene datos de contaminación del aire por coordenadas
- Mide: **PM2.5, PM10, O3, NO2, SO2, CO**
- Devuelve índice AQI (1-5)

**¿Por qué es crítico?**
- ✅ **Datos de calidad del aire en tiempo real**
- ✅ **Ideal para comparar con satélite NASA TEMPO**
- ✅ **Mediciones terrestres precisas**
- ✅ **Todos los contaminantes clave**

**Uso en tu app:**
```javascript
// Usuario hace click en Google Maps
const coords = { lat: 19.4326, lon: -99.1332 };

// Obtener contaminación
const pollution = await fetch(
  `/openweather/air-pollution?lat=${coords.lat}&lon=${coords.lon}`
);

// Mostrar en dashboard:
// PM2.5: 12.45 μg/m³
// AQI: 3 (Moderado)
```

---

### 2. **Clima Actual con Calidad del Aire (WeatherAPI)** ⭐⭐⭐⭐⭐
```http
GET /weather-api/current?location=Mexico City&aqi=yes
```

**¿Qué hace?**
- Clima actual + calidad del aire en una sola petición
- Incluye: temperatura, humedad, viento, **PM2.5, PM10, O3, NO2, CO**

**¿Por qué es crítico?**
- ✅ **Combina clima + contaminación**
- ✅ **Datos más completos que OpenWeather**
- ✅ **Funciona con ciudad o coordenadas**
- ✅ **Perfecto para dashboard principal**

**Uso en tu app:**
```javascript
// Obtener todo en una llamada
const data = await fetch(
  `/weather-api/current?location=19.43,-99.13&aqi=yes`
);

// Dashboard muestra:
// Clima: 22°C, Nublado
// Contaminación: PM2.5 = 12.3 μg/m³
// Correlación: ¿El clima afecta la contaminación?
```

---

### 3. **Pronóstico con AQI (WeatherAPI)** ⭐⭐⭐⭐
```http
GET /weather-api/forecast?location=Mexico City&days=7&aqi=yes
```

**¿Qué hace?**
- Pronóstico de 1-14 días
- Incluye calidad del aire futura
- Datos por hora y por día

**¿Por qué es importante?**
- ✅ **Predice contaminación futura**
- ✅ **Alertas tempranas de mala calidad del aire**
- ✅ **Análisis de tendencias**

**Uso en tu app:**
```javascript
// Pronóstico 7 días
const forecast = await fetch(
  `/weather-api/forecast?location=Mexico City&days=7&aqi=yes`
);

// Mostrar gráfica:
// Día 1: PM2.5 = 10 (Bueno)
// Día 2: PM2.5 = 25 (Moderado)
// Día 3: PM2.5 = 45 (Insalubre) ⚠️ ALERTA
```

---

## 🌍 **Endpoints para Integración con Google Maps**

### 4. **Búsqueda de Ubicaciones (WeatherAPI)** ⭐⭐⭐⭐
```http
GET /weather-api/search?query=Monte
```

**¿Qué hace?**
- Busca ciudades en tiempo real
- Autocompletado de ubicaciones
- Devuelve coordenadas

**¿Por qué es importante?**
- ✅ **Autocompletar búsqueda de usuario**
- ✅ **Obtener coordenadas de ciudades**
- ✅ **Integración con Google Maps**

**Uso en tu app:**
```javascript
// Usuario escribe en buscador
<input onChange={(e) => searchCity(e.target.value)} />

async function searchCity(query) {
  const results = await fetch(`/weather-api/search?query=${query}`);
  // Mostrar: Monterrey, Mexico
  //          Montevideo, Uruguay
  //          Montpellier, France
}

// Usuario selecciona → Obtener lat/lon → Marcar en mapa
```

---

### 5. **Clima Actual por Coordenadas (OpenWeather)** ⭐⭐⭐
```http
GET /openweather/current/coords?lat=19.4326&lon=-99.1332
```

**¿Qué hace?**
- Clima por coordenadas exactas
- Mediciones meteorológicas

**¿Por qué es importante?**
- ✅ **Perfecto para Google Maps**
- ✅ **Usuario hace click → Obtener clima**
- ✅ **Funciona en cualquier parte del mundo**

---

## 📊 **Endpoints para Análisis y Comparación**

### 6. **Pronóstico por Coordenadas (OpenWeather)** ⭐⭐⭐
```http
GET /openweather/forecast/coords?lat=19.4326&lon=-99.1332
```

**¿Qué hace?**
- Pronóstico 5 días (cada 3 horas)
- 40 puntos de datos

**¿Por qué es útil?**
- ✅ **Análisis detallado hora por hora**
- ✅ **Comparar con pronóstico de WeatherAPI**
- ✅ **Validación cruzada de datos**

---

## 🔍 **Endpoints Secundarios**

### 7. **Clima por Ciudad (OpenWeather)** ⭐⭐
```http
GET /openweather/current/city?city=Mexico City
```

**Uso:** Alternativa cuando no tienes coordenadas

### 8. **Pronóstico por Ciudad (OpenWeather)** ⭐⭐
```http
GET /openweather/forecast/city?city=Monterrey
```

**Uso:** Pronóstico cuando solo tienes nombre de ciudad

### 9. **Datos Históricos (WeatherAPI)** ⭐⭐
```http
GET /weather-api/history?location=Mexico City&date=2025-09-15
```

**Uso:** Analizar tendencias históricas

### 10. **Astronomía (WeatherAPI)** ⭐
```http
GET /weather-api/astronomy?location=Mexico City
```

**Uso:** Salida/puesta del sol (menos relevante para contaminación)

### 11. **Zona Horaria (WeatherAPI)** ⭐
```http
GET /weather-api/timezone?location=Mexico City
```

**Uso:** Sincronizar timestamps

---

## 🎯 **Flujo Recomendado para tu App NASA**

### **Escenario 1: Usuario busca una ciudad**
```javascript
1. /weather-api/search?query=Monterrey
   → Obtener coordenadas

2. /weather-api/current?location=25.68,-100.31&aqi=yes
   → Clima + AQI actual

3. /openweather/air-pollution?lat=25.68&lon=-100.31
   → Contaminación detallada

4. Mostrar en dashboard con gráficas
```

### **Escenario 2: Usuario hace click en Google Maps**
```javascript
1. Usuario click en mapa → coords: (lat, lon)

2. Petición paralela:
   Promise.all([
     fetch(`/weather-api/current?location=${lat},${lon}&aqi=yes`),
     fetch(`/openweather/air-pollution?lat=${lat}&lon=${lon}`)
   ])

3. Comparar ambos datos
   → Mostrar promedio o marcar diferencias

4. Marcar en mapa con color según AQI:
   Verde: Bueno
   Amarillo: Moderado
   Rojo: Malo
```

### **Escenario 3: Dashboard con múltiples ciudades**
```javascript
const cities = [
  { name: 'CDMX', coords: [19.43, -99.13] },
  { name: 'Monterrey', coords: [25.68, -100.31] },
  { name: 'Guadalajara', coords: [20.65, -103.34] }
];

// Obtener datos de todas
const data = await Promise.all(
  cities.map(city => 
    fetch(`/weather-api/current?location=${city.coords}&aqi=yes`)
  )
);

// Comparar calidad del aire entre ciudades
// Gráfica: ¿Cuál ciudad tiene mejor aire?
```

---

## ⚡ **Endpoints por Prioridad para NASA**

| Prioridad | Endpoint | Uso en Desafío NASA |
|-----------|----------|---------------------|
| 🔴 **MUY ALTA** | `/openweather/air-pollution` | Datos de contaminación terrestres |
| 🔴 **MUY ALTA** | `/weather-api/current?aqi=yes` | Dashboard principal |
| 🟡 **ALTA** | `/weather-api/forecast?aqi=yes` | Predicción y alertas |
| 🟡 **ALTA** | `/weather-api/search` | Integración Google Maps |
| 🟢 **MEDIA** | `/openweather/current/coords` | Datos adicionales clima |
| 🟢 **MEDIA** | `/openweather/forecast/coords` | Pronóstico detallado |
| ⚪ **BAJA** | `/weather-api/history` | Análisis opcional |
| ⚪ **BAJA** | `/openweather/current/city` | Búsqueda por nombre |
| ⚪ **BAJA** | `/openweather/forecast/city` | Pronóstico por nombre |
| ⚪ **BAJA** | `/weather-api/astronomy` | Datos astronómicos |
| ⚪ **BAJA** | `/weather-api/timezone` | Zona horaria |

---

## 💡 **Recomendación Final para tu Proyecto**

### **Usa estos 3 endpoints principales:**

1. **`/weather-api/current?location={coords}&aqi=yes`**
   - Tu endpoint principal
   - Dashboard de calidad del aire

2. **`/openweather/air-pollution?lat={lat}&lon={lon}`**
   - Validación cruzada de datos
   - Más contaminantes

3. **`/weather-api/search?query={city}`**
   - Búsqueda de ubicaciones
   - Integración Google Maps

Con estos 3 puedes construir toda tu aplicación para el desafío NASA! 🚀

---

## 📋 **Lista Completa de Endpoints Disponibles**

### **OpenWeather API (5 endpoints)**
1. `GET /openweather/current/coords` - Clima actual por coordenadas
2. `GET /openweather/current/city` - Clima actual por ciudad
3. `GET /openweather/forecast/coords` - Pronóstico por coordenadas
4. `GET /openweather/forecast/city` - Pronóstico por ciudad
5. `GET /openweather/air-pollution` - Contaminación del aire ⭐

### **WeatherAPI.com (6 endpoints)**
1. `GET /weather-api/current` - Clima actual con AQI ⭐
2. `GET /weather-api/forecast` - Pronóstico hasta 14 días ⭐
3. `GET /weather-api/search` - Buscar ubicaciones ⭐
4. `GET /weather-api/history` - Datos históricos
5. `GET /weather-api/astronomy` - Datos astronómicos
6. `GET /weather-api/timezone` - Zona horaria

**Total: 11 endpoints REST disponibles**

---

## 🌐 **URLs del Servidor**

- **Servidor:** http://localhost:3000
- **Swagger UI:** http://localhost:3000/api
- **OpenAPI JSON:** http://localhost:3000/api-json

---

## 🚀 **Comandos**

```bash
# Iniciar servidor desarrollo
npm run start:dev

# Build
npm run build

# Producción
npm run start:prod
```

---

## 📊 **Contaminantes Monitoreados**

| Contaminante | Descripción | Fuente de Datos |
|--------------|-------------|-----------------|
| **PM2.5** | Partículas < 2.5μm | OpenWeather, WeatherAPI |
| **PM10** | Partículas < 10μm | OpenWeather, WeatherAPI |
| **O3** | Ozono | OpenWeather, WeatherAPI |
| **NO2** | Dióxido de Nitrógeno | OpenWeather, WeatherAPI |
| **SO2** | Dióxido de Azufre | OpenWeather |
| **CO** | Monóxido de Carbono | OpenWeather, WeatherAPI |
| **NH3** | Amoníaco | OpenWeather |

---

## ✅ **Estado del Proyecto**

- ✅ 2 APIs integradas (OpenWeather + WeatherAPI)
- ✅ 11 endpoints REST operativos
- ✅ Swagger UI documentado
- ✅ Validación de datos con DTOs
- ✅ CORS habilitado
- ✅ Listo para Google Maps
- ✅ Ideal para NASA Space Apps Challenge

---

**Desarrollado para:** NASA Space Apps Challenge 2025  
**Tema:** Monitoreo de Calidad del Aire  
**Backend:** NestJS + TypeScript
