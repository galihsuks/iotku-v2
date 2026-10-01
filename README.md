# Iotku V2

Iotku V2 is an IoT monitoring application built with a React frontend, an Express TypeScript backend, and a separate TypeScript migration/seeder app.

The app supports sensor ownership, shared sensor access, realtime WebSocket readings, API logging, WebSocket logging, role-based menu access, and system administration pages.

## Project Structure

```text
iotku-v2/
  backend/     Express + TypeScript API and WebSocket server
  frontend/    React + TypeScript + Vite web app
  migration/   TypeScript SQL migration and seeder runner
  postman/     Postman collections, mainly for WebSocket testing
```

## Tech Stack

- Backend: Express, TypeScript, MySQL, Zod, JWT, WebSocket, Swagger UI
- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Zustand
- Migration: TypeScript, MySQL, raw SQL migration files

## Requirements

- Node.js
- npm
- MySQL or MariaDB

## Quick Start

### 1. Clone and prepare environment files

Copy each environment example into a local `.env` file:

```bash
cd backend
copy .env.example .env

cd ../frontend
copy .env.example .env

cd ../migration
copy .env.example .env
```

Adjust database credentials, ports, and URLs as needed.

### 2. Install dependencies

Run this in each app folder:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../migration
npm install
```

### 3. Run database migration and seeders

```bash
cd migration
npm run migrate:up
npm run seed
```

Default seeded super admin:

```text
username: superadmin
email: admin@iotku.test
password: password123
```

### 4. Run the backend

```bash
cd backend
npm run dev
```

Default services:

- HTTP API: `http://localhost:8082`
- WebSocket: `ws://localhost:4002`
- Swagger UI: `http://localhost:8082/docs`
- OpenAPI JSON: `http://localhost:8082/openapi.json`

### 5. Run the frontend

```bash
cd frontend
npm run dev
```

Default frontend URL:

- `http://localhost:5173`

## Main Features

- Authentication with HTTP-only cookie
- Signup and login
- Profile and password management
- Role, menu, user, parameter, log, and WebSocket log system pages
- Sensor create, update, delete, share, and join flows
- Sensor unit management with fixed value options for switch or enum-like devices
- Sensor reading history with chart/table views
- Realtime sensor readings through WebSocket
- Device online/offline status
- Excel export for sensor readings
- API documentation through Swagger UI

## WebSocket Overview

The WebSocket server runs separately from the HTTP API.

Device connection example:

```text
ws://localhost:4002?idsensor=00001&passkey=device-passkey&is_device=1
```

Frontend clients can connect once and subscribe or unsubscribe without reconnecting:

```json
{ "type": "subscribe", "idsensor": ["00001", "00002"] }
```

```json
{ "type": "unsubscribe", "idsensor": ["00001"] }
```

Frontend clients can also send realtime commands to online devices:

```json
{ "type": "command", "idsensor": "00001", "value": "open" }
```

The server forwards valid commands to the active device socket. The device should execute the command and publish the actual state back as a normal sensor reading.

Realtime sensor reading event:

```json
{
  "type": "sensor_reading",
  "success": true,
  "message": "Sensor reading received.",
  "data": {
    "sensor_code": "00001",
    "reading": {
      "id": "reading-id",
      "sensor_id": "sensor-id",
      "value": "28.5",
      "recorded_at_ms": 1760000000000
    }
  }
}
```

## Database Naming Convention

Base application tables use the `app_*` prefix.

IoT domain tables do not use the prefix:

- `sensor_units`
- `sensors`
- `sensor_shared_users`
- `sensor_readings`
- `websocket_logs`

## Useful Scripts

Backend:

```bash
npm run dev
npm run build
npm run start
npm run format
npm run format:check
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

Migration:

```bash
npm run migrate:up
npm run migrate:down -- --steps=1
npm run migrate:status
npm run migrate:create -- migration_name
npm run seed
npm run seed -- --names=baseAppSeeder
```

## Versioning Notes

For local development, app versions can come from package metadata or environment variables.

For future CI/CD, a recommended release flow is:

1. Publish a GitHub Release with a tag, for example `v1.2.3`.
2. Run CI/CD only when the release is not a draft and not a pre-release.
3. Inject the release tag into backend and frontend build environment variables.
4. Display the same version in Swagger, frontend UI, and deployment metadata.

Recommended environment names:

- Backend: `APP_VERSION`
- Frontend: `VITE_APP_VERSION`

## More Documentation

Each app has its own README:

- `backend/README.md`
- `frontend/README.md`
- `migration/README.md`
