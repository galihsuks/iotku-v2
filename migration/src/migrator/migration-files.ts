import fs from "node:fs/promises";
import path from "node:path";
import { migrationDir } from "../utils/paths.js";

export type MigrationFile = {
  version: string;
  name: string;
  upPath: string;
  downPath: string;
};

const parseUpFile = (filename: string) => {
  const match = filename.match(/^(\d{14})_(.+)\.up\.sql$/);
  if (!match) return null;
  return {
    version: match[1],
    name: match[2],
  };
};

export const listMigrationFiles = async () => {
  await fs.mkdir(migrationDir, { recursive: true });
  const entries = await fs.readdir(migrationDir);
  const migrations: MigrationFile[] = [];

  for (const entry of entries) {
    const parsed = parseUpFile(entry);
    if (!parsed) continue;

    migrations.push({
      ...parsed,
      upPath: path.join(migrationDir, entry),
      downPath: path.join(migrationDir, `${parsed.version}_${parsed.name}.down.sql`),
    });
  }

  return migrations.sort((a, b) => a.version.localeCompare(b.version));
};

export const readSql = async (filePath: string) => {
  const sql = await fs.readFile(filePath, "utf8");
  return sql.trim();
};

export const createMigrationFiles = async (rawName: string) => {
  await fs.mkdir(migrationDir, { recursive: true });
  const name = rawName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!name) throw new Error("Migration name is required.");

  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(
    now.getHours(),
  )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const upPath = path.join(migrationDir, `${timestamp}_${name}.up.sql`);
  const downPath = path.join(migrationDir, `${timestamp}_${name}.down.sql`);

  await fs.writeFile(upPath, "-- Write migration SQL here\n", "utf8");
  await fs.writeFile(downPath, "-- Write rollback SQL here\n", "utf8");

  return { upPath, downPath };
};
