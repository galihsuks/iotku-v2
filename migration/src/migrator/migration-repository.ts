import type { RowDataPacket } from "mysql2";
import type { Db } from "../db/mysql.js";

export type AppliedMigration = {
  version: string;
  name: string;
  batch: number;
  applied_at: string;
};

export const ensureMigrationTable = async (db: Db) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(14) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      batch INT NOT NULL,
      applied_at DATETIME NOT NULL
    )
  `);
};

export const getAppliedMigrations = async (db: Db) => {
  const [rows] = await db.query<(AppliedMigration & RowDataPacket)[]>(
    `SELECT version, name, batch, applied_at FROM schema_migrations ORDER BY version ASC`,
  );
  return rows;
};

export const getLastBatch = async (db: Db) => {
  const [rows] = await db.query<(RowDataPacket & { batch: number | null })[]>(
    `SELECT MAX(batch) AS batch FROM schema_migrations`,
  );
  return Number(rows[0]?.batch ?? 0);
};

export const insertMigration = async (
  db: Db,
  migration: { version: string; name: string },
  batch: number,
) => {
  await db.execute(
    `INSERT INTO schema_migrations (version, name, batch, applied_at) VALUES (?, ?, ?, NOW())`,
    [migration.version, migration.name, batch],
  );
};

export const deleteMigration = async (db: Db, version: string) => {
  await db.execute(`DELETE FROM schema_migrations WHERE version = ?`, [version]);
};
