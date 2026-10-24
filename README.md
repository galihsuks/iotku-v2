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

Default seeded accounts:

```text
username: superadmin
email: admin@iotku.test
password: 123456

username: admin
email: admin.user@iotku.test
password: 123456

username: user
email: user@iotku.test
password: 123456
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
- Public developer guides: `http://localhost:5173/docs`

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

The server forwards valid commands to the active device socket with a generated `command_id`. Its immediate acknowledgement confirms delivery only. A matching reading from that device, such as `{ "value": "open" }`, confirms the command and cancels its timeout; including `command_id` in the reading makes correlation more reliable. The device can instead send an explicit `command_result` with `success: true`, or `success: false` and a failure `message`. Only the requesting frontend receives the result; normal readings update every subscriber. One command per sensor can be pending at a time. The sender receives a failure result if the device disconnects or does not respond within 30 seconds.

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

Production versioning follows the GitHub Release tag:

1. Publish a GitHub Release with a tag, for example `v1.2.3`.
2. CI/CD deploys it when the release is published, including pre-releases.
3. The workflow sets `VITE_APP_VERSION=1.2.3` for the frontend and `APP_VERSION=1.2.3` for the PM2 backend process.
4. The frontend UI and backend Swagger display the release version.

For local development, these variables can still be set manually:

- Backend: `APP_VERSION`
- Frontend: `VITE_APP_VERSION`

## Deployment

`.github/workflows/deploy.yml` runs whenever a GitHub Release is published, including a pre-release. A draft, push to `main`, or tag push alone does not deploy. The workflow builds the frontend and backend from the release tag, copies the backend build to `/mine/iotku-v2/backend` on the VPS, installs its production dependencies, restarts its existing PM2 process, and then copies `frontend/dist` to Niagahoster. Migration is not part of CI/CD.

The release tag supplies both app versions: `v1.2.3` becomes `1.2.3` in the frontend and backend runtime. Publish the workflow file on the default branch before creating a release.

Configure these GitHub Actions **repository variables**:

| Variable | Value |
| --- | --- |
| `VITE_BASE_URL_API` | Public HTTPS URL of the backend API |
| `VITE_WS_URL` | Public `wss://` URL of the WebSocket server |
| `VITE_APP_TITLE` | Frontend title |
| `PM2_APP_NAME_VPS` | Exact name of the existing backend process in `pm2 list` |

Configure these GitHub Actions **repository secrets**:

| Secret | Purpose |
| --- | --- |
| `SSH_HOST_FE`, `SSH_USER_FE`, `SSH_PASSWORD_FE`, `SSH_PORT_FE` | Existing Niagahoster SSH connection |
| `SSH_HOST_VPS`, `SSH_USER_VPS`, `SSH_PORT_VPS` | VPS SSH connection |
| `SSH_KEY_VPS` | Private SSH key authorized for the VPS user |
| `SSH_FINGERPRINT_VPS` | SHA256 fingerprint of the VPS SSH host key |

Prepare the VPS once before the first deployment:

1. Install Node.js 24, npm, and PM2. Ensure the SSH user can write to `/mine/iotku-v2/backend`. The SSH user must be the same user that owns the PM2 process (for example, `ubuntu`). Node, npm, and PM2 must be available in a non-interactive SSH session; the workflow also tries to load `~/.nvm/nvm.sh` when PM2 is not on `PATH`.
2. Create `/mine/iotku-v2/backend/.env` from `backend/.env.example`. It stays on the VPS and is never uploaded by CI. Set production database credentials, `NODE_ENV=production`, a strong `JWT_SECRET`, and the public frontend origin.
3. Register the backend once in PM2 if it is not already running, from the same SSH user used by CI:

   ```bash
   cd /mine/iotku-v2/backend
   pm2 start dist/server.js --name iotku-v2-backend
   pm2 save
   pm2 list
   ```

   Set `PM2_APP_NAME_VPS` to the exact existing process name shown by `pm2 list`. If the backend already has a different name, keep it and use that name; CI does not create a duplicate process. PM2's `restart` briefly interrupts active WebSocket connections, so clients should reconnect.
4. Manage migrations manually on the VPS. Update the `migration` folder there, keep its `.env` configured for the production database, then run:

   ```bash
   cd /mine/iotku-v2/migration
   npm ci
   npm run migrate:up
   ```

   Run `npm run seed` only when intentionally initializing data; seeders create default accounts. CI neither copies the migration app nor runs migrations or seeders.

Keep database backups and apply schema changes before deploying backend code that depends on them. The web host must route frontend paths such as `/docs` back to `index.html`.

The VPS reverse proxy must expose the backend HTTP port as HTTPS and the separate WebSocket port as WSS, including the WebSocket upgrade headers. Set `VITE_BASE_URL_API` and `VITE_WS_URL` to those public endpoints, not to `localhost`.

Check the VPS host fingerprint directly on the VPS with `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`; verify it through a trusted channel before saving the `SHA256:...` value as a GitHub secret. Never copy a private host key into GitHub.

## More Documentation

Each app has its own README:

- `backend/README.md`
- `frontend/README.md`
- `migration/README.md`
