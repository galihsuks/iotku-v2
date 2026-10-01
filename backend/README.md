# Iotku V2 Backend

Express + TypeScript backend for the Iotku V2 app.

The backend provides the HTTP API, authentication, role/menu access control, sensor management, sensor reading history, Excel export, API logging, WebSocket logging, Swagger/OpenAPI documentation, and the realtime WebSocket server.

## Tech Stack

- Express
- TypeScript
- MySQL
- Zod
- JWT
- HTTP-only auth cookie
- WebSocket
- Swagger UI
- ExcelJS

## Setup

```bash
cd backend
copy .env.example .env
npm install
```

Update `.env` with your local database, ports, JWT secret, frontend origin, and WebSocket admin key.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run format:check
```

## Environment

Main environment variables:

```env
APP_NAME=Iotku V2 API
APP_VERSION=
NODE_ENV=development
PORT=8082
WS_PORT=4002
FRONTEND_ORIGIN=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=iotku_v2

JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=1d
AUTH_COOKIE_NAME=auth_token
SUPER_ADMIN_EMAIL=admin@iotku.test
SUPER_ADMIN_PASSWORD=password123
WS_ADMIN_KEY=change-this-ws-key
```

## App Version

Backend app version is exposed through Swagger/OpenAPI and the root health endpoint.

Version source priority:

1. `APP_VERSION` from `.env` or deployment environment
2. `version` from `backend/package.json`
3. fallback `0.1.0`

For local development, `APP_VERSION` can be left empty:

```env
APP_VERSION=
```

For CI/CD releases, set `APP_VERSION` from the GitHub Release tag:

```env
APP_VERSION=1.2.3
```

## Development Server

```bash
npm run dev
```

Default services:

- HTTP API: `http://localhost:8082`
- WebSocket: `ws://localhost:4002`
- Swagger UI: `http://localhost:8082/docs`
- OpenAPI JSON: `http://localhost:8082/openapi.json`

The root endpoint returns basic app metadata:

```http
GET /
```

```json
{
  "message": "API Iotku V2 API",
  "data": {
    "app_name": "Iotku V2 API",
    "version": "0.1.0",
    "environment": "development"
  }
}
```

## API Documentation

Swagger UI is available at:

```text
http://localhost:8082/docs
```

Swagger reads the API version from `APP_VERSION` when available.

Authentication uses an HTTP-only cookie. Run `POST /api/auth/login` first from Swagger, then protected endpoints can be tested from the same browser session.

## API Modules

Mounted API groups:

- `/api/auth`
- `/api/access`
- `/api/dropdown`
- `/api/log`
- `/api/menu`
- `/api/menu-control`
- `/api/parameter`
- `/api/role`
- `/api/role-menu-control`
- `/api/sensor`
- `/api/user`
- `/api/websocket-log`

## Database

Use the migration app in `../migration` for database migrations and seeders.

```bash
cd ../migration
npm run migrate:up
npm run seed
```

Base app tables keep the `app_*` prefix. IoT domain tables intentionally do not use the prefix:

- `sensor_units`
- `sensors`
- `sensor_shared_users`
- `sensor_readings`
- `websocket_logs`

Sensor units can define fixed command/value options through `value_options`. The value is stored as JSON text and returned to the frontend as an array:

```json
[
  { "label": "Open", "value": "open" },
  { "label": "Close", "value": "close" }
]
```

When `value_options` is available, sensor readings and WebSocket commands must use one of the configured values.

Sensor unit options can be managed from the frontend admin page:

```text
/admin/sensor-unit
```

Default seeded super admin:

```text
username: superadmin
email: admin@iotku.test
password: password123
```

## Authentication Flow

1. User logs in through `POST /api/auth/login`.
2. Backend validates credentials and sets an HTTP-only auth cookie.
3. Frontend checks the active session through `GET /api/auth/me`.
4. Protected requests use the auth cookie automatically.
5. Unauthorized requests return `401` and the frontend redirects the user to login.

## Access Control Flow

The base app uses role-based menu and control access.

- Menus are stored in app menu tables.
- Each menu can have controls such as `C`, `R`, `U`, `D`, and `AC`.
- Roles are assigned access to menu controls.
- Frontend reads allowed menus and controls from the access API.

Common control codes:

- `C`: Create
- `R`: Read
- `U`: Update
- `D`: Delete
- `AC`: Access Control

## WebSocket Flow

The WebSocket server runs separately from the HTTP API.

Default URL:

```text
ws://localhost:4002
```

### Device Handshake

Device sockets connect with `idsensor`, `passkey`, and `is_device=1`:

```text
ws://localhost:4002?idsensor=00001&passkey=device-passkey&is_device=1
```

Rules:

- `idsensor` can be the sensor code or supported sensor identifier.
- `passkey` is stored on the sensor.
- Only one active device socket is allowed per sensor.
- A device socket can only write data to the sensor used during handshake.
- When the device connects or disconnects, subscribers receive a `device_info` event.

### Frontend Subscribe/Unsubscribe

Frontend clients can connect once, then subscribe or unsubscribe without reconnecting.

Subscribe:

```json
{ "type": "subscribe", "idsensor": ["00001", "00002"] }
```

Unsubscribe:

```json
{ "type": "unsubscribe", "idsensor": ["00001"] }
```

### Device Info

Request device info:

```json
{ "type": "device_info", "idsensor": ["00001", "00002"] }
```

Response:

```json
{
  "type": "device_info",
  "success": true,
  "message": "Device info loaded.",
  "data": [
    {
      "sensor_code": "00001",
      "connection_status": true,
      "ip_device": "127.0.0.1",
      "connected_at": "2026-10-01 10:00:00"
    }
  ]
}
```

### Sensor Reading

Authenticated device sockets can send raw values:

```text
27.5
```

Or JSON payloads:

```json
{
  "value": "27.5",
  "recorded_at_ms": 1760000000000
}
```

Subscribers receive realtime reading events:

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
      "value": "27.5",
      "recorded_at_ms": 1760000000000
    }
  }
}
```

### Command Flow

Frontend clients can send realtime commands through WebSocket:

```json
{
  "type": "command",
  "idsensor": "00001",
  "value": "open"
}
```

Server behavior:

1. Validate the sensor.
2. Ensure the sender socket has subscribed to the target sensor room.
3. Validate the command value against `value_options` when options are configured.
4. Check whether the device socket is online.
5. Forward the command only to the active device socket for that sensor.
6. Return an acknowledgement to the sender.

Command delivered to the device:

```json
{
  "type": "command",
  "success": true,
  "message": "Command received.",
  "data": {
    "sensor_code": "00001",
    "value": "open",
    "requested_at_ms": 1760000000000
  }
}
```

Sender acknowledgement:

```json
{
  "type": "command",
  "success": true,
  "message": "Command sent to device.",
  "data": {
    "sensor_code": "00001",
    "value": "open",
    "requested_at_ms": 1760000000000
  }
}
```

The device should execute the command and then publish its actual state back as a normal sensor reading. Other subscribed frontend clients update after that reading is broadcast.

### Admin Monitor Socket

Admin monitor socket uses the same WebSocket URL:

```text
ws://localhost:4002
```

Then sends the admin handshake:

```json
{ "isAdmin": true, "key": "change-this-ws-key" }
```

Only one active admin socket is allowed.

## Logging

HTTP API requests are logged into `app_logs`.

WebSocket events are logged into `websocket_logs`, including:

- connection
- disconnection
- handshake failure
- subscribe
- unsubscribe
- device info request
- WebSocket errors

The API log and WebSocket log pages support keyword, level, date, and time filters.

## Build and Production Start

```bash
npm run build
npm run start
```

Make sure production environment variables are available before running `npm run start`.
