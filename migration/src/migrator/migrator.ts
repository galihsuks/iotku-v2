import fs from "node:fs/promises";
import { createConnection } from "../db/mysql.js";
import { createMigrationFiles, listMigrationFiles, readSql } from "./migration-files.js";
import {
  deleteMigration,
  ensureMigrationTable,
  getAppliedMigrations,
  getLastBatch,
  insertMigration,
} from "./migration-repository.js";

export const migrateUp = async () => {
  const db = await createConnection();
  try {
    await ensureMigrationTable(db);
    const migrations = await listMigrationFiles();
    const applied = new Set((await getAppliedMigrations(db)).map((item) => item.version));
    const pending = migrations.filter((item) => !applied.has(item.version));

    if (pending.length === 0) {
      console.log("No pending migrations.");
      return;
    }

    const batch = (await getLastBatch(db)) + 1;
    for (const migration of pending) {
      console.log(`Migrating up ${migration.version}_${migration.name}`);
      const sql = await readSql(migration.upPath);
      if (sql) await db.query(sql);
      await insertMigration(db, migration, batch);
    }
  } finally {
    await db.end();
  }
};

export const migrateDown = async (steps: number) => {
  const db = await createConnection();
  try {
    await ensureMigrationTable(db);
    const applied = (await getAppliedMigrations(db)).sort((a, b) =>
      b.version.localeCompare(a.version),
    );
    const targets = applied.slice(0, Math.max(1, steps));
    const files = await listMigrationFiles();

    if (targets.length === 0) {
      console.log("No migrations to rollback.");
      return;
    }

    for (const target of targets) {
      const migration = files.find((item) => item.version === target.version);
      if (!migration) throw new Error(`Migration file not found for version ${target.version}`);

      await fs.access(migration.downPath);
      console.log(`Migrating down ${migration.version}_${migration.name}`);
      const sql = await readSql(migration.downPath);
      if (sql) await db.query(sql);
      await deleteMigration(db, migration.version);
    }
  } finally {
    await db.end();
  }
};

export const migrationStatus = async () => {
  const db = await createConnection();
  try {
    await ensureMigrationTable(db);
    const files = await listMigrationFiles();
    const applied = new Set((await getAppliedMigrations(db)).map((item) => item.version));

    for (const migration of files) {
      const status = applied.has(migration.version) ? "up" : "down";
      console.log(`${status.padEnd(5)} ${migration.version}_${migration.name}`);
    }
  } finally {
    await db.end();
  }
};

export const createMigration = async (name: string) => {
  const result = await createMigrationFiles(name);
  console.log(`Created ${result.upPath}`);
  console.log(`Created ${result.downPath}`);
};
