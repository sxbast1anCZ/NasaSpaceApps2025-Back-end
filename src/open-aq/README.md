# 📡 OpenAQ Module - API Integration

Módulo para integrar la API de OpenAQ v3 y obtener datos de calidad del aire.

## 📁 Estructura

```
src/open-aq/
├── dto/
│   └── location-query.dto.ts     # DTOs para validación de queries
├── interfaces/
│   └── openaq.interface.ts        # Interfaces TypeScript de OpenAQ
├── open-aq.controller.ts          # Controlador REST con endpoints
├── open-aq.service.ts             # Lógica de negocio e integración
├── open-aq.module.ts              # Módulo NestJS
└── README.md                      # Esta documentación
```

## 🚀 Endpoints Disponibles

### 1️⃣ **Fetch Locations (Principal)**
Consulta OpenAQ con coordenadas, procesa los datos y retorna JSON completo.

```
GET /open-aq/fetch-locations?latitude={lat}&longitude={lon}
```

**Ejemplo:**
```bash
GET http://localhost:3000/open-aq/fetch-locations?latitude=44.90588053635772&longitude=-98.8344817893032
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Datos obtenidos y procesados correctamente",
  "coordinates": {
    "latitude": 44.90588053635772,
    "longitude": -98.8344817893032
  },
  "radius": 25000,
  "rawData": {
    "meta": { "found": 45, "limit": 100, "page": 1 },
    "results": [ /* array de ubicaciones */ ]
  },
  "processedData": {
    "processed": true,
    "count": 45,
    "stats": { /* estadísticas */ }
  }
}
```

---

### 2️⃣ **Get Locations (Simple)**
Obtiene ubicaciones cercanas sin procesamiento adicional.

```
GET /open-aq/locations?latitude={lat}&longitude={lon}&radius={radius}&limit={limit}
```

**Parámetros:**
- `latitude` (required): -90 a 90
- `longitude` (required): -180 a 180
- `radius` (optional): 100 a 25000 metros (default: 25000)
- `limit` (optional): 1 a 1000 (default: 100)

**Ejemplo:**
```bash
GET http://localhost:3000/open-aq/locations?latitude=19.4326&longitude=-99.1332&radius=10000&limit=50
```

---

### 3️⃣ **Health Check**
Verifica que el servicio esté funcionando.

```
GET /open-aq/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "service": "OpenAQ API Integration",
  "endpoints": [...]
}
```

---

## 🔑 Configuración

### Variables de Entorno (.env)

```env
# API Keys
OPENAQ_API_KEY=tu-api-key-aqui
```

### Verificación

Al iniciar el servidor, verás:
```
✅ OPENAQ_API_KEY cargada correctamente
```

O si falta:
```
⚠️  OPENAQ_API_KEY no está configurada en el archivo .env
```

---

## 🛠️ Uso desde Código

### Inyectar el servicio

```typescript
import { OpenAqService } from './open-aq/open-aq.service';

constructor(private readonly openAqService: OpenAqService) {}

async myMethod() {
  const data = await this.openAqService.fetchLocationsData(
    44.90588053635772,
    -98.8344817893032
  );
  
  console.log(data.rawData.meta.found); // Total encontrado
  console.log(data.processedData.stats); // Estadísticas
}
```

---

## 🔧 Personalizar Procesamiento

Edita la función `processLocationsData()` en `open-aq.service.ts`:

```typescript
async processLocationsData(jsonData: any) {
  const locations = jsonData.results || [];
  
  // TU LÓGICA AQUÍ
  // Ejemplo: Filtrar solo PM2.5
  const pm25Locations = locations.filter(loc =>
    loc.parameters?.some(p => p.name === 'pm25')
  );
  
  // Ejemplo: Guardar en base de datos
  // await this.prisma.location.createMany({ data: ... });
  
  return {
    processed: true,
    count: pm25Locations.length,
    data: pm25Locations,
  };
}
```

---

## 📊 Logs del Servidor

Cuando haces una petición, verás:

```
🔍 Consultando OpenAQ API...
📍 Coordenadas: 44.90588053635772, -98.8344817893032
📏 Radio: 25000m (25km)
🔑 API Key configurada: Sí ✓
✅ Datos obtenidos exitosamente
📊 Total de ubicaciones encontradas: 45
📦 Ubicaciones en respuesta: 45
🔧 Procesando datos de ubicaciones...
📝 Procesadas 45 ubicaciones
📅 Con datos recientes (7 días): 12
🌍 Países encontrados: US
```

---

## 🐛 Debugging de Errores

Si hay un error 422, verás logs detallados:

```
❌ Error al consultar OpenAQ: Request failed with status code 422
📄 Respuesta de error: { detail: "..." }
🔢 Código de estado: 422
🔍 Detalles completos del error: {
  "message": "...",
  "status": 422,
  "data": { ... },
  "params": { ... }
}
```

---

## 🧪 Testing

### 1. Inicia el servidor
```bash
npm run start:dev
```

### 2. Prueba los endpoints

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/open-aq/fetch-locations?latitude=44.90588053635772&longitude=-98.8344817893032"
```

**cURL:**
```bash
curl "http://localhost:3000/open-aq/fetch-locations?latitude=44.90588053635772&longitude=-98.8344817893032"
```

**Navegador:**
```
http://localhost:3000/open-aq/fetch-locations?latitude=44.90588053635772&longitude=-98.8344817893032
```

---

## ⚙️ Características

- ✅ **API Key Management**: Carga automática desde .env
- ✅ **Error Handling**: Manejo robusto de errores con logs detallados
- ✅ **Validation**: Validación de parámetros con class-validator
- ✅ **TypeScript**: Interfaces completas para type safety
- ✅ **Logging**: Logs coloridos y descriptivos
- ✅ **Processing**: Función personalizable para procesar datos
- ✅ **Stats**: Generación automática de estadísticas

---

## 📚 Recursos

- [OpenAQ v3 API Docs](https://docs.openaq.org/)
- [API Explorer](https://explore.openaq.org/)
- [Rate Limits](https://docs.openaq.org/docs/authentication): 10,000 requests/día

---

## 🎯 Próximos Pasos

1. Personaliza `processLocationsData()` con tu lógica
2. Agrega más endpoints según necesites
3. Integra con tu base de datos
4. Implementa caché para optimizar
5. Agrega autenticación si es necesario

¡Listo para usar! 🚀
