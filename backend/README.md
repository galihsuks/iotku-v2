# Iotku V2 Backend

Express + TypeScript backend for the Iotku V2 app.

## Scripts

```bash
npm install
npm run dev
npm run build
```

## API Docs

When the backend is running:

- Swagger UI: `http://localhost:8082/docs`
- OpenAPI JSON: `http://localhost:8082/openapi.json`

## Database

Use the migration app in `../migration` for database migration and seeders.

Base app tables keep the `app_*` prefix. IoT domain tables intentionally do not use the prefix:

- `sensor_units`
- `sensors`
- `sensor_shared_users`
- `sensor_readings`
- `websocket_logs`

Default seeded login:

- username/email: `superadmin` or `admin@iotku.test`
- password: `password123`

## WebSocket Flow

WebSocket berjalan terpisah dari HTTP API, default di `ws://localhost:4002`.

Device connect memakai sensor code dan passkey:

```text
ws://localhost:4002?idsensor=00001&passkey=device-passkey&is_device=1
```

Client/frontend bisa connect sekali lalu subscribe/unsubscribe sensor tanpa reconnect:

```json
{ "type": "subscribe", "idsensor": ["00001", "00002"] }
```

```json
{ "type": "unsubscribe", "idsensor": ["00001"] }
```

Device yang sudah lolos passkey hanya boleh menulis data untuk sensor saat handshake.
Jika device connect atau disconnect, subscriber sensor tersebut akan menerima event:

```json
{
  "type": "device_info",
  "success": true,
  "message": "Device info updated.",
  "data": [
    {
      "sensor_code": "00001",
      "connection_status": false,
      "ip_device": null,
      "connected_at": null
    }
  ]
}
```
