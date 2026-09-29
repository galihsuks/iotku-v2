import type { RowDataPacket } from "mysql2";
import { execute, queryRows } from "../../../repositories/base.repository.js";
import { nowSql } from "../../../utils/date.js";
import { buildPagination, getPagination } from "../../../utils/pagination.js";
import { like } from "../shared/query.js";

export type LogQuery = {
  page?: unknown;
  page_size?: unknown;
  keywords?: string;
  level?: "info" | "warning" | "error" | "";
  date?: string;
  start_time?: string;
  end_time?: string;
};

export const createLog = async (payload: {
  level: "info" | "warning" | "error";
  message: string;
  context?: Record<string, unknown>;
  ipAddress?: string | null;
}) => {
  await execute(
    `INSERT INTO app_logs (level, message, context, ip_address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      payload.level,
      payload.message,
      JSON.stringify(payload.context ?? {}),
      payload.ipAddress ?? null,
      nowSql(),
      nowSql(),
    ],
  );
};

const buildWhere = (query: LogQuery) => {
  const conditions: string[] = [];
  const values: unknown[] = [];
  const keywords = query.keywords?.trim() ?? "";

  if (keywords) {
    conditions.push("(message LIKE ? OR context LIKE ? OR level LIKE ? OR ip_address LIKE ?)");
    values.push(like(keywords), like(keywords), like(keywords), like(keywords));
  }

  if (query.level) {
    conditions.push("level = ?");
    values.push(query.level);
  }

  if (query.date) {
    conditions.push("DATE(created_at) = ?");
    values.push(query.date);
  }

  if (query.start_time) {
    conditions.push("TIME(created_at) >= ?");
    values.push(query.start_time);
  }

  if (query.end_time) {
    conditions.push("TIME(created_at) <= ?");
    values.push(query.end_time);
  }

  return {
    clause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
};

export const listLogs = async (query: LogQuery) => {
  const { page, pageSize, offset } = getPagination(query);
  const where = buildWhere(query);
  const rows = await queryRows(
    `SELECT id, level, message, context, ip_address, created_at, updated_at
     FROM app_logs
     ${where.clause}
     ORDER BY id DESC
     LIMIT ? OFFSET ?`,
    [...where.values, pageSize, offset],
  );
  const count = await queryRows<{ total: number } & RowDataPacket>(
    `SELECT COUNT(*) AS total FROM app_logs ${where.clause}`,
    where.values,
  );
  return { rows, pagination: buildPagination(page, pageSize, Number(count[0]?.total ?? 0)) };
};

export const clearLogs = (query: LogQuery) => {
  const where = buildWhere(query);
  return execute(`DELETE FROM app_logs ${where.clause}`, where.values as Parameters<typeof execute>[1]);
};
