# TickGo — Proyecto Fútbol

Plataforma de venta y reserva de entradas para partidos de fútbol, compuesta por un frontend en React y tres microservicios backend (autenticación, eventos/estadios y reservas).

## Arquitectura

| Componente | Tecnología | Puerto | Base de datos |
|---|---|---|---|
| Frontend (TickGo) | React + Vite + PrimeReact | `5173` | - |
| Master (auth) | Spring Boot | `8080` | PostgreSQL |
| Eventos | NestJS | `3000` | MySQL |
| Reservas | NestJS | `3001` | MySQL |

Los tres backends comparten el mismo `JWT_SECRET`, ya que el microservicio **master** emite los tokens y los otros dos los validan. El microservicio **reservas** además consume al microservicio **eventos** (para leer partidos/asientos) y a **master** (para leer datos de usuario).

## Requisitos previos

- Node.js (para frontend, eventos y reservas)
- Java + Maven (para master)
- PostgreSQL corriendo localmente
- MySQL corriendo localmente
- Credenciales SMTP (para el envío de credenciales de acceso desde master)

## Bases de datos a crear

Antes de levantar los servicios, crea las siguientes bases de datos vacías:

```sql
-- PostgreSQL
CREATE DATABASE reservas_futbol_usuarios;

-- MySQL
CREATE DATABASE eventos_db;
CREATE DATABASE reservas_db;
```

Las tablas se generan automáticamente:
- **Master**: por Hibernate (`ddl-auto: update`).
- **Eventos / Reservas**: por TypeORM (`synchronize: true`).

---

## 1. Frontend (React + Vite)

Crear un archivo `.env` en la raíz del frontend:

```dotenv
VITE_EVENTOS_URL=http://localhost:3000
VITE_RESERVAS_URL=http://localhost:3001
VITE_MASTER_URL=http://localhost:8080
```

**Instalar y ejecutar:**

```bash
npm install
npm run dev
```

Se levanta en: `http://localhost:5173/`

---

## 2. Microservicio Master (Spring Boot — Autenticación)

Encargado de la autenticación, usuarios, roles y parámetros del sistema. Usa **PostgreSQL**.

Configuración en `src/main/resources/application.yaml`. Los valores están definidos con variables de entorno (`${VAR:default}`); para desarrollo local puedes dejar los valores por defecto o sobreescribirlos con variables de entorno reales:

```yaml
server:
  port: ${SERVER_PORT:8080}

spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:reservas_futbol_usuarios}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:postgres}

app:
  jwt:
    secret: ${JWT_SECRET:tuClaveSecretaBase64DeAlMenos256Bits}
    access-token-expiration-ms: ${JWT_ACCESS_EXP_MS:900000}        # 15 minutos
    refresh-token-expiration-ms: ${JWT_REFRESH_EXP_MS:604800000}   # 7 días
  cors:
    allowed-origin: ${CORS_ORIGIN:http://localhost:5173}
  mail:
    from: ${MAIL_FROM:no-reply@tickgo.com}
```

> ⚠️ El valor de `app.jwt.secret` debe ser **idéntico** (y estar en **base64**) al `JWT_SECRET` usado en los microservicios de eventos y reservas.

### Seeder de datos iniciales

El proyecto incluye un seeder (`ec.edu.espe.master.config.DataSeeder`) que corre automáticamente al iniciar la aplicación y crea roles, parámetros y usuarios de prueba:

| Usuario | Password | Rol |
|---|---|---|
| `admin@espe.edu.ec` | `password123` | admin |
| `cliente@gmail.com` | `password123` | client |
| `mixto@espe.edu.ec` | `password123` | admin + client |

**Ejecutar:**

```bash
./mvnw spring-boot:run
```

Se levanta en: `http://localhost:8080`

---

## 3. Microservicio de Eventos (NestJS)

Gestiona partidos, estadios, secciones, filas y asientos. Usa **MySQL**.

Crear un archivo `.env`:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=eventos_db

PORT=3000
CORS_ORIGIN=http://localhost:5173
```

**Instalar y ejecutar:**

```bash
npm install
npm run start:dev
```

Se levanta en: `http://localhost:3000`

### Datos de prueba (seed)

El seed (`src/seed/seed.service.ts`) corre automáticamente al iniciar la aplicación y crea partidos, estadios, secciones y asientos de demostración.

---

## 4. Microservicio de Reservas (NestJS)

Gestiona las reservas, tickets y reportes. Usa **MySQL**. Su seed depende de los datos ya creados por el microservicio de eventos y de los usuarios creados por master.

Crear un archivo `.env`:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=reservas_db

PORT=3001
CORS_ORIGIN=http://localhost:5173

# JWT (misma clave en base64 que en Spring Boot y en eventos-ms)
JWT_SECRET=tuClaveSecretaBase64DeAlMenos256Bits

# URLs de los otros microservicios
EVENTOS_MS_URL=http://localhost:3000
MASTER_MS_URL=http://localhost:8080
```

**Instalar y ejecutar:**

```bash
npm install
npm run start:dev
```

Se levanta en: `http://localhost:3001`

### Datos de prueba (seed)

El seed (`src/seed/seed.service.ts`) corre automáticamente al iniciar la aplicación y crea reservas y tickets de demostración para los usuarios `cliente@gmail.com` y `mixto@espe.edu.ec`.

---

## Orden recomendado de arranque

1. Crear las bases de datos (`reservas_futbol_usuarios`, `eventos_db`, `reservas_db`).
2. Levantar **Master** (autenticación) — `http://localhost:8080`.
3. Levantar **Eventos** — `http://localhost:3000` (su seed corre solo).
4. Levantar **Reservas** — `http://localhost:3001` (su seed corre solo).
5. Levantar el **Frontend** — `http://localhost:5173`.

## Notas de seguridad

- Nunca subir al repositorio los valores reales de `DB_PASSWORD`, credenciales SMTP ni `JWT_SECRET`. Usar variables de entorno o un `.env` ignorado por git.
- El `JWT_SECRET` debe ser el mismo valor en base64 en los tres backends para que la validación de tokens funcione entre microservicios.
