import type { RowDataPacket } from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { execute, queryOne, queryRows } from "../../../repositories/base.repository.js";
import { notFound } from "../../../utils/app-error.js";
import { nowSql } from "../../../utils/date.js";
import { buildPagination, getPagination } from "../../../utils/pagination.js";
import { cleanNullable, like, type KeywordQuery } from "../shared/query.js";

export const listRoles = async (query: KeywordQuery) => {
  const { page, pageSize, offset } = getPagination(query);
  const keywords = query.keywords?.trim() ?? "";
  const where = keywords ? "WHERE code LIKE ? OR name LIKE ? OR description LIKE ?" : "";
  const values = keywords ? [like(keywords), like(keywords), like(keywords)] : [];
  const rows = await queryRows(
    `SELECT id, code, name, description, created_at, updated_at FROM app_roles ${where} ORDER BY code ASC LIMIT ? OFFSET ?`,
    [...values, pageSize, offset],
  );
  const count = await queryOne<{ total: number } & RowDataPacket>(
    `SELECT COUNT(*) AS total FROM app_roles ${where}`,
    values,
  );
  return { rows, pagination: buildPagination(page, pageSize, Number(count?.total ?? 0)) };
};

export const getRole = async (id: string) => {
  const row = await queryOne(
    `SELECT id, code, name, description, created_at, updated_at FROM app_roles WHERE id = ?`,
    [id],
  );
  if (!row) throw notFound("Role not found.");
  return row;
};

export const saveRole = async (
  payload: { code: string; name: string; description?: string | null },
  id?: string,
) => {
  const now = nowSql();
  if (id) {
    await execute(
      `UPDATE app_roles SET code = ?, name = ?, description = ?, updated_at = ? WHERE id = ?`,
      [payload.code, payload.name, cleanNullable(payload.description), now, id],
    );
    return getRole(id);
  }
  const newId = uuidv4();
  await execute(
    `INSERT INTO app_roles (id, code, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [newId, payload.code, payload.name, cleanNullable(payload.description), now, now],
  );
  return getRole(newId);
};

export const deleteRole = async (id: string) => {
  const row = await getRole(id);
  await execute(`DELETE FROM app_roles WHERE id = ?`, [id]);
  return row;
};
