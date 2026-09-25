import type { RowDataPacket } from "mysql2";
import { execute, queryRows } from "../../../repositories/base.repository.js";
import { buildPagination, getPagination } from "../../../utils/pagination.js";
import { like } from "../shared/query.js";

export type WebSocketLogQuery = {
  page?: unknown;
  page_size?: unknown;
  keywords?: string;
  level?: "info" | "warning" | "error" | "";
  date?: string;
  start_time?: string;
  end_time?: string;
};

const buildWhere = (query: WebSocketLogQuery) => {
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

export const listLogs = async (query: WebSocketLogQuery) => {
  const { page, pageSize, offset } = getPagination(query);
  const where = buildWhere(query);
  const rows = await queryRows(
    `SELECT id, level, message, context, ip_address, created_at, updated_at
     FROM websocket_logs
     ${where.clause}
     ORDER BY id DESC
     LIMIT ? OFFSET ?`,
    [...where.values, pageSize, offset],
  );
  const count = await queryRows<{ total: number } & RowDataPacket>(
    `SELECT COUNT(*) AS total FROM websocket_logs ${where.clause}`,
    where.values,
  );

  return { rows, pagination: buildPagination(page, pageSize, Number(count[0]?.total ?? 0)) };
};

export const clearLogs = (query: WebSocketLogQuery) => {
  const where = buildWhere(query);
  return execute(
    `DELETE FROM websocket_logs ${where.clause}`,
    where.values as Parameters<typeof execute>[1],
  );
};
