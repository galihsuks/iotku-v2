import { type RowDataPacket, type ResultSetHeader } from "mysql2";
import { db, type DbConnection } from "../config/database.js";

export const queryRows = async <T extends RowDataPacket = RowDataPacket>(
  sql: string,
  values: unknown[] = [],
) => {
  const [rows] = await db.query<T[]>(sql, values);
  return rows;
};

export const queryOne = async <T extends RowDataPacket = RowDataPacket>(
  sql: string,
  values: unknown[] = [],
) => {
  const rows = await queryRows<T>(sql, values);
  return rows[0] ?? null;
};

export const execute = async (
  sql: string,
  values: Parameters<typeof db.execute>[1] = [],
  conn?: DbConnection,
) => {
  const runner = conn ?? db;
  const [result] = await runner.execute<ResultSetHeader>(sql, values);
  return result;
};
