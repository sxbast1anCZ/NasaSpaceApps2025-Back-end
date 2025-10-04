# NASA Space Apps Challenge 2025 - Backend

Backend API para el proyecto de monitoreo de calidad del aire usando datos satelitales de NASA TEMPO.

## 🚀 Tecnologías

- **NestJS** - Framework de Node.js
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **Docker** - Contenedorización de PostgreSQL

## 📋 Requisitos Previos

- Node.js 18+ 
- npm
- Docker y Docker Compose

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/sxbast1anCZ/NasaSpaceApps2025-Back-end.git
cd NasaSpaceApps2025-Back-end
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

El archivo `.env` ya contiene la configuración correcta para desarrollo local.

### 4. Iniciar PostgreSQL con Docker

```bash
docker-compose up -d
```

Verificar que el contenedor esté corriendo:

```bash
docker ps
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run start:dev
```

El servidor estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
src/
├── app.controller.ts    # Controlador principal
├── app.module.ts        # Módulo raíz
├── app.service.ts       # Servicio principal
└── main.ts              # Punto de entrada de la aplicación

prisma/
└── schema.prisma        # Schema de la base de datos
```

## 🗄️ Base de Datos

### Conexión

La base de datos PostgreSQL corre en Docker con las siguientes credenciales:

- **Host:** localhost
- **Puerto:** 5432
- **Usuario:** root
- **Contraseña:** root
- **Base de datos:** nasa_db

### Comandos útiles de Docker

```bash
# Iniciar contenedor
docker-compose up -d

# Detener contenedor
docker-compose down

# Ver logs
docker-compose logs -f postgres

# Conectarse a la base de datos
docker exec -it nasa-postgres psql -U root -d nasa_db
```

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 📦 Comandos Disponibles

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Linting
npm run lint
npm run format
```

## 🤝 Contribución

Este proyecto es parte del NASA Space Apps Challenge 2025.

## 📄 Licencia

MIT
