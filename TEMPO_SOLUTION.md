# Solución para Datos TEMPO sin Timestamp

## 🎯 Problema Identificado

Los datos obtenidos de **Giovanni (TEMPO)** no incluyen:
- ❌ Timestamp/hora de la medición
- ❌ Metadatos temporales

Esto dificulta:
- Tracking histórico
- Sistema de alertas en tiempo real
- Análisis de tendencias

---

## 💡 Propuestas de Solución

### **Opción 1: Enriquecer datos con timestamp en el momento de inserción (RECOMENDADO)**

**Ventajas:**
- ✅ Simple de implementar
- ✅ Ya lo tenemos en los modelos (`createdAt`)
- ✅ Permite tracking de cuando se recibió el dato

**Cómo funciona:**
```typescript
// Cuando recibas el JSON de TEMPO
const tempoData = {
  latitude: -23.6509,
  longitude: -70.3975,
  value: 45.2 // PM2.5
  // NO tiene timestamp
};

// El backend agrega automáticamente el timestamp
await prisma.pM_Data.create({
  data: {
    latitude: tempoData.latitude,
    longitude: tempoData.longitude,
    value: tempoData.value,
    // createdAt se agrega automáticamente
  }
});
```

**Limitación:**
- El timestamp es de cuando se inserta, no de cuando TEMPO midió

---

### **Opción 2: Consultar APIs complementarias con timestamps**

Usar otras fuentes de datos de NASA que SÍ incluyen timestamps:

#### **A) NASA EARTHDATA - TEMPO Direct API**
En lugar de Giovanni, usar la API directa de TEMPO:
```
https://earthdata.nasa.gov/earth-observation-data/near-real-time/tempo
```

**Ventajas:**
- ✅ Datos en tiempo real
- ✅ Incluye timestamps
- ✅ Mayor granularidad temporal

**Desventaja:**
- ⚠️ Requiere autenticación NASA Earthdata
- ⚠️ Formato diferente al de Giovanni

#### **B) OpenAQ API (Ground Sensors)**
Complementar con datos de sensores terrestres:
```
https://api.openaq.org/v2/measurements
```

**Ejemplo de respuesta:**
```json
{
  "coordinates": {
    "latitude": -23.6509,
    "longitude": -70.3975
  },
  "parameter": "pm25",
  "value": 45.2,
  "date": {
    "utc": "2025-10-04T15:30:00Z",  // ✅ Tiene timestamp!
    "local": "2025-10-04T12:30:00-03:00"
  }
}
```

**Ventajas:**
- ✅ Datos con timestamp preciso
- ✅ Ya tienes la API key configurada
- ✅ Valida datos satelitales con mediciones terrestres

---

### **Opción 3: Agregar campo de fecha estimada en base a metadatos**

Modificar los modelos de Prisma para incluir un campo de fecha estimada:

```prisma
model PM_Data {
  id                Int      @id @default(autoincrement())
  latitude          Float
  longitude         Float
  value             Float
  createdAt         DateTime @default(now())  // Cuando se insertó
  measurementDate   DateTime?                 // Fecha estimada de la medición
  dataSource        String   @default("TEMPO_GIOVANNI")
}
```

**Cómo obtener la fecha estimada:**
- Revisar metadatos del JSON de Giovanni
- Buscar campos como: `date`, `time_start`, `time_end`, `acquisition_date`
- Si no existe, usar la fecha actual

---

## 🚨 Sistema de Alertas - Propuesta

Para que funcione el sistema de alertas **SIN timestamps precisos**, puedes:

### **Estrategia: Alertas basadas en "última medición disponible"**

```typescript
// Servicio de Alertas
async checkAirQualityAlerts(lat: number, lon: number) {
  // Obtener la medición MÁS RECIENTE para esa ubicación
  const latestPM = await prisma.pM_Data.findFirst({
    where: {
      latitude: { gte: lat - 0.5, lte: lat + 0.5 },
      longitude: { gte: lon - 0.5, lte: lon + 0.5 },
    },
    orderBy: { createdAt: 'desc' }
  });

  // Definir umbrales de alerta
  const alerts = [];
  
  if (latestPM.value > 150) {
    alerts.push({
      level: 'DANGEROUS',
      message: 'Calidad del aire peligrosa',
      pollutant: 'PM2.5',
      value: latestPM.value,
      timestamp: latestPM.createdAt
    });
  } else if (latestPM.value > 50) {
    alerts.push({
      level: 'MODERATE',
      message: 'Calidad del aire moderada',
      pollutant: 'PM2.5',
      value: latestPM.value,
      timestamp: latestPM.createdAt
    });
  }

  return alerts;
}
```

### **Actualización periódica con Cron Jobs**

```typescript
// Cada X minutos, consultar Giovanni/TEMPO
@Cron('0 */30 * * * *') // Cada 30 minutos
async updateTempoData() {
  const newData = await fetchGiovanniData();
  
  // Insertar datos nuevos
  await prisma.pM_Data.createMany({
    data: newData.map(d => ({
      latitude: d.lat,
      longitude: d.lon,
      value: d.pm25,
      // createdAt se genera automáticamente
    }))
  });
  
  // Verificar si hay alertas
  await this.checkAirQualityAlerts();
}
```

---

## 📊 Recomendación Final

**Para el hackathon y MVP:**

1. ✅ **Usar Opción 1** - Timestamp en inserción (ya implementado)
2. ✅ **Complementar con OpenAQ** (Opción 2B) - Datos terrestres con timestamps reales
3. ✅ **Sistema de alertas basado en "última medición"** - Funciona sin timestamps precisos

**Estructura propuesta:**
```
Datos TEMPO (Giovanni)
  ├─ PM, O3, NO2 sin timestamp
  ├─ Se insertan con createdAt actual
  └─ Se usan para visión general/mapa de calor

Datos OpenAQ (Sensores)
  ├─ Con timestamps precisos
  ├─ Validan datos satelitales
  └─ Triggers para alertas en tiempo real

Sistema de Alertas
  ├─ Query de "última medición disponible"
  ├─ Umbrales configurables
  └─ Notificaciones cuando se supera umbral
```

---

## 🔄 Siguiente Paso

¿Quieres que implemente:
- A) Integración con OpenAQ API (para tener timestamps reales)
- B) Servicio de procesamiento de JSONs de Giovanni
- C) Sistema de alertas básico
- D) Todo lo anterior paso a paso

**Solo dime cuál prefieres y lo armamos modularmente** 🚀
