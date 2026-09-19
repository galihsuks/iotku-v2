# Iotku V2 Backend

Express + TypeScript backend for the Iotku V2 app.

## Scripts

```bash
npm install
npm run dev
npm run build
```

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
