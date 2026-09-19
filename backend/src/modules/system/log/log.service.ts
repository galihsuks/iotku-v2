import type { RowDataPacket } from "mysql2";
import { execute, queryRows } from "../../../repositories/base.repository.js";
import { nowSql } from "../../../utils/date.js";
import { buildPagination, getPagination } from "../../../utils/pagination.js";
import { like, type KeywordQuery } from "../shared/query.js";

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

export const listLogs = async (query: KeywordQuery) => {
  const { page, pageSize, offset } = getPagination(query);
  const keywords = query.keywords?.trim() ?? "";
  const where = keywords ? "WHERE message LIKE ? OR level LIKE ? OR ip_address LIKE ?" : "";
  const values = keywords ? [like(keywords), like(keywords), like(keywords)] : [];
  const rows = await queryRows(
    `SELECT id, level, message, context, ip_address, created_at, updated_at FROM app_logs ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...values, pageSize, offset],
  );
  const count = await queryRows<{ total: number } & RowDataPacket>(
    `SELECT COUNT(*) AS total FROM app_logs ${where}`,
    values,
  );
  return { rows, pagination: buildPagination(page, pageSize, Number(count[0]?.total ?? 0)) };
};

export const clearLogs = () => execute(`DELETE FROM app_logs`);
