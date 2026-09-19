import { v4 as uuidv4 } from "uuid";
import { execute, queryOne, queryRows } from "../../../repositories/base.repository.js";
import { notFound } from "../../../utils/app-error.js";
import { nowSql } from "../../../utils/date.js";

export const listMenuControls = (menuId: string) =>
  queryRows(
    `SELECT id, menu_id, code, name, created_at, updated_at FROM app_menu_controls WHERE menu_id = ? ORDER BY code ASC`,
    [menuId],
  );

export const saveMenuControl = async (
  payload: { menu_id: string; code: string; name: string },
  id?: string,
) => {
  const now = nowSql();
  if (id) {
    await execute(
      `UPDATE app_menu_controls SET menu_id = ?, code = ?, name = ?, updated_at = ? WHERE id = ?`,
      [payload.menu_id, payload.code, payload.name, now, id],
    );
    return queryOne(`SELECT * FROM app_menu_controls WHERE id = ?`, [id]);
  }
  const newId = uuidv4();
  await execute(
    `INSERT INTO app_menu_controls (id, menu_id, code, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [newId, payload.menu_id, payload.code, payload.name, now, now],
  );
  return queryOne(`SELECT * FROM app_menu_controls WHERE id = ?`, [newId]);
};

export const deleteMenuControl = async (id: string) => {
  const row = await queryOne(`SELECT * FROM app_menu_controls WHERE id = ?`, [id]);
  if (!row) throw notFound("Menu control not found.");
  await execute(`DELETE FROM app_menu_controls WHERE id = ?`, [id]);
  return row;
};
