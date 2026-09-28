import type { RowDataPacket } from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { execute, queryOne, queryRows } from "../../../repositories/base.repository.js";
import { notFound } from "../../../utils/app-error.js";
import { nowSql } from "../../../utils/date.js";
import { buildPagination, getPagination } from "../../../utils/pagination.js";
import { like, type KeywordQuery } from "../shared/query.js";

export const listParameters = async (query: KeywordQuery) => {
  const { page, pageSize, offset } = getPagination(query);
  const keywords = query.keywords?.trim() ?? "";
  const where = keywords ? "WHERE `key` LIKE ? OR `value` LIKE ? OR datatype LIKE ?" : "";
  const values = keywords ? [like(keywords), like(keywords), like(keywords)] : [];
  const rows = await queryRows(
    `SELECT id, \`key\`, \`value\`, datatype, created_at, updated_at FROM app_parameters ${where} ORDER BY \`key\` ASC LIMIT ? OFFSET ?`,
    [...values, pageSize, offset],
  );
  const count = await queryOne<{ total: number } & RowDataPacket>(
    `SELECT COUNT(*) AS total FROM app_parameters ${where}`,
    values,
  );
  return { rows, pagination: buildPagination(page, pageSize, Number(count?.total ?? 0)) };
};

export const getParameter = async (id: string) => {
  const row = await queryOne(
    `SELECT id, \`key\`, \`value\`, datatype, created_at, updated_at FROM app_parameters WHERE id = ?`,
    [id],
  );
  if (!row) throw notFound("Parameter not found.");
  return row;
};

export const saveParameter = async (
  payload: { key: string; value: string; datatype: string },
  id?: string,
) => {
  const now = nowSql();
  if (id) {
    await execute(
      `UPDATE app_parameters SET \`key\` = ?, \`value\` = ?, datatype = ?, updated_at = ? WHERE id = ?`,
      [payload.key, payload.value, payload.datatype, now, id],
    );
    return getParameter(id);
  }
  const newId = uuidv4();
  await execute(
    `INSERT INTO app_parameters (id, \`key\`, \`value\`, datatype, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [newId, payload.key, payload.value, payload.datatype, now, now],
  );
  return getParameter(newId);
};

export const deleteParameter = async (id: string) => {
  const row = await getParameter(id);
  await execute(`DELETE FROM app_parameters WHERE id = ?`, [id]);
  return row;
};
