# Iotku V2 Migration Seeder

Migration/seeder app terpisah untuk project Iotku V2.

## Setup

```bash
cd migration
copy .env.example .env
npm install
```

Isi `.env` sesuai database lokal.

## Commands

```bash
npm run migrate:up
npm run migrate:down -- --steps=1
npm run migrate:status
npm run migrate:create -- nama_migration
npm run seed
npm run seed -- --names=baseAppSeeder
npm run seed -- --names=baseAppSeeder,sensorUnitSeeder
```

## Default Login

Seeder `baseAppSeeder` membuat akun super admin default:

```text
username: superadmin
email: admin@iotku.test
password: password123
```

Migration file memakai format:

```text
database/migrations/{timestamp}_{name}.up.sql
database/migrations/{timestamp}_{name}.down.sql
```
