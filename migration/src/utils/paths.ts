import path from "node:path";

export const rootDir = process.cwd();
export const migrationDir = path.resolve(rootDir, "database", "migrations");
