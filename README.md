# TickGo

Sistema de venta de entradas para partidos de fútbol. El proyecto está dividido en 4 piezas independientes que se comunican entre sí: un frontend en React y tres microservicios (autenticación, eventos/estadios y reservas). Cada uno vive en su propia carpeta y se levanta por separado con los comandos de su propio framework.

## Stack por servicio

- **frontend/** → React + Vite + PrimeReact → corre en `5173`
- **Backend/master-ms/** (login, usuarios, roles) → Spring Boot + PostgreSQL → corre en `8080`
- **Backend/eventos-ms/** (partidos, estadios, asientos) → NestJS + MySQL → corre en `3000`
- **Backend/reservas-ms/** (reservas, tickets, reportes) → NestJS + MySQL → corre en `3001`

`reservas-ms` le pide datos a `eventos-ms` (asientos/partidos) y a `master-ms` (usuarios). Los 3 backends validan tokens firmados con el mismo `JWT_SECRET`, porque quien los genera es únicamente `master-ms`.

## Antes de arrancar

Necesitas tener corriendo localmente:

- PostgreSQL → para `master-ms`
- MySQL → para `eventos-ms` y `reservas-ms`
- Node.js → frontend, eventos-ms, reservas-ms
- Java + Maven → master-ms

Crea las 3 bases de datos vacías (las tablas las genera cada ORM solo al arrancar):

```sql
CREATE DATABASE reservas_futbol_usuarios;  -- Postgres, la usa master-ms
```

```sql
CREATE DATABASE eventos_db;   -- MySQL
CREATE DATABASE reservas_db;  -- MySQL
```

---

## master-ms (Spring Boot)

Login, usuarios, roles y parámetros del sistema. La configuración vive en `src/main/resources/application.yaml` con variables de entorno y valores por defecto (`${VAR:default}`), así que puedes correrlo tal cual en local o sobreescribir con tus propias env vars:

```yaml
app:
  jwt:
    secret: ${JWT_SECRET:tuClaveSecretaBase64DeAlMenos256Bits}
  cors:
    allowed-origin: ${CORS_ORIGIN:http://localhost:5173}
```

Al iniciar corre un seeder automático (`DataSeeder`) que deja creados estos usuarios de prueba:

- `admin@espe.edu.ec` / `password123` → rol admin
- `cliente@gmail.com` / `password123` → rol client
- `mixto@espe.edu.ec` / `password123` → admin + client

```bash
./mvnw spring-boot:run
```

## eventos-ms (NestJS)

Partidos, estadios, secciones, filas y asientos. Necesita un `.env` propio en su carpeta:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=eventos_db
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

```bash
npm install
npm run start:dev
```

También corre su propio seed al arrancar, dejando partidos, estadios y asientos de ejemplo.

## reservas-ms (NestJS)

Reservas, tickets y reportes. Depende de que `eventos-ms` y `master-ms` ya tengan datos, así que conviene levantarlo al final. Su `.env`:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=reservas_db
PORT=3001
CORS_ORIGIN=http://localhost:5173

JWT_SECRET=tuClaveSecretaBase64DeAlMenos256Bits   # igual al de master-ms

EVENTOS_MS_URL=http://localhost:3000
MASTER_MS_URL=http://localhost:8080
```

```bash
npm install
npm run start:dev
```

## frontend

`.env` en la raíz de `frontend/`:

```dotenv
VITE_EVENTOS_URL=http://localhost:3000
VITE_RESERVAS_URL=http://localhost:3001
VITE_MASTER_URL=http://localhost:8080
```

```bash
npm install
npm run dev
```

Queda disponible en `http://localhost:5173`.

---

## Orden para probarlo todo de una

1. Bases de datos creadas
2. `master-ms` arriba (`8080`)
3. `eventos-ms` arriba (`3000`)
4. `reservas-ms` arriba (`3001`)
5. `frontend` arriba (`5173`) y ya puedes loguearte con cualquiera de los usuarios de prueba

**Ojo:** el `JWT_SECRET` tiene que ser exactamente el mismo (en base64) en `master-ms` y `reservas-ms`, si no, los tokens no validan. Y nada de contraseñas ni secretos reales van al repo — cada `.env` se queda solo en tu máquina.
