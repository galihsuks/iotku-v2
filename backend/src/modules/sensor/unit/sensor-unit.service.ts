import type { RowDataPacket } from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { execute, queryOne, queryRows } from "../../../repositories/base.repository.js";
import { badRequest, notFound } from "../../../utils/app-error.js";
import { nowSql } from "../../../utils/date.js";
import { buildPagination, getPagination } from "../../../utils/pagination.js";
import { like, type SensorKeywordQuery } from "../shared/query.js";

export const listUnits = async (query: SensorKeywordQuery) => {
  const { page, pageSize, offset } = getPagination(query);
  const keywords = query.keywords?.trim() ?? "";
  const where = keywords ? "WHERE name LIKE ? OR unit LIKE ? OR value_type LIKE ?" : "";
  const values = keywords ? [like(keywords), like(keywords), like(keywords)] : [];
  const rows = await queryRows(
    `SELECT * FROM sensor_units ${where} ORDER BY name LIMIT ? OFFSET ?`,
    [...values, pageSize, offset],
  );
  const count = await queryOne<{ total: number } & RowDataPacket>(
    `SELECT COUNT(*) AS total FROM sensor_units ${where}`,
    values,
  );
  return { rows, pagination: buildPagination(page, pageSize, Number(count?.total ?? 0)) };
};

export const saveUnit = async (
  payload: { name: string; unit: string; value_type: "number" | "string" },
  id?: string,
) => {
  const now = nowSql();
  if (id) {
    await execute(
      `UPDATE sensor_units SET name = ?, unit = ?, value_type = ?, updated_at = ? WHERE id = ?`,
      [payload.name, payload.unit, payload.value_type, now, id],
    );
    return queryOne(`SELECT * FROM sensor_units WHERE id = ?`, [id]);
  }
  const newId = uuidv4();
  await execute(
    `INSERT INTO sensor_units (id, name, unit, value_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [newId, payload.name, payload.unit, payload.value_type, now, now],
  );
  return queryOne(`SELECT * FROM sensor_units WHERE id = ?`, [newId]);
};

export const deleteUnit = async (id: string) => {
  const used = await queryOne<{ total: number } & RowDataPacket>(
    `SELECT COUNT(*) AS total FROM sensors WHERE unit_id = ?`,
    [id],
  );
  if (Number(used?.total ?? 0) > 0) throw badRequest("Sensor unit is being used.");
  const row = await queryOne(`SELECT * FROM sensor_units WHERE id = ?`, [id]);
  if (!row) throw notFound("Sensor unit not found.");
  await execute(`DELETE FROM sensor_units WHERE id = ?`, [id]);
  return row;
};
