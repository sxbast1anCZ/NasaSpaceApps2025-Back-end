# 🚀 Guía Rápida - OpenAQ Module

## 📁 Estructura Lista

```
src/open-aq/
├── dto/
│   └── location-query.dto.ts     ✅ En blanco - Agrega tus DTOs
├── interfaces/
│   └── openaq.interface.ts        ✅ En blanco - Agrega tus interfaces
├── open-aq.controller.ts          ✅ En blanco - Agrega tus endpoints
├── open-aq.service.ts             ✅ Configurado con API Key
└── open-aq.module.ts              ✅ Configurado y listo
```

---

## ✅ Configuración Base Incluida

### `open-aq.service.ts`
- ✅ Constructor con `HttpService` y `ConfigService`
- ✅ API Key cargada desde `.env`
- ✅ Método `getHeaders()` que incluye la API Key
- ✅ Base URL de OpenAQ v3

```typescript
private readonly baseUrl = 'https://api.openaq.org/v3';
private readonly apiKey: string;

private getHeaders() {
  return {
    'X-API-Key': this.apiKey,
  };
}
```

---

## 🔧 Cómo Agregar Funciones

### 1️⃣ En `open-aq.service.ts`

```typescript
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

// Agrega tus funciones después del método getHeaders()

async tuNombreDeFuncion(parametros) {
  try {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/endpoint`, {
        headers: this.getHeaders(), // ✅ Incluye API Key automáticamente
        params: {
          // tus parámetros
        },
      }),
    );
    
    return response.data;
  } catch (error) {
    throw new HttpException(
      `Error: ${error.message}`,
      error.response?.status || HttpStatus.BAD_REQUEST,
    );
  }
}
```

### 2️⃣ En `open-aq.controller.ts`

```typescript
import { Controller, Get, Query } from '@nestjs/common';

@Get('tu-endpoint')
async tuEndpoint(@Query('param') param: string) {
  return this.openAqService.tuNombreDeFuncion(param);
}
```

---

## 📚 Ejemplo Completo

### Service:
```typescript
async getLocations(lat: number, lon: number) {
  try {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/locations`, {
        headers: this.getHeaders(),
        params: {
          coordinates: `${lat},${lon}`,
          radius: 25000,
        },
      }),
    );
    return response.data;
  } catch (error) {
    throw new HttpException(
      `Error: ${error.message}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
```

### Controller:
```typescript
@Get('locations')
async getLocations(
  @Query('lat') lat: number,
  @Query('lon') lon: number,
) {
  return this.openAqService.getLocations(lat, lon);
}
```

---

## 🧪 Testing

```bash
# 1. Inicia el servidor
npm run start:dev

# 2. Prueba tu endpoint
curl "http://localhost:3000/open-aq/tu-endpoint?param=valor"
```

---

## 📦 Imports Útiles

```typescript
// Para HTTP requests
import { HttpException, HttpStatus } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

// Para decoradores
import { Get, Post, Put, Delete, Query, Param, Body } from '@nestjs/common';

// Para validación
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
```

---

## 🔑 API Key

Ya está configurada automáticamente desde tu archivo `.env`:
```env
OPENAQ_API_KEY=b4ea0080901ca7e8dafb076bae3837eb67402de3b1bd1632766bbd2a0a354868
```

Todos tus requests incluirán el header:
```
X-API-Key: tu-api-key
```

---

## 📝 Endpoints de OpenAQ v3

- `GET /locations` - Estaciones de monitoreo
- `GET /locations/{id}/latest` - Últimas mediciones de una estación
- `GET /measurements` - Mediciones históricas
- `GET /countries` - Lista de países
- `GET /parameters` - Tipos de contaminantes

Ver más: https://docs.openaq.org/

---

¡Todo listo para que agregues tus funciones! 🎉
