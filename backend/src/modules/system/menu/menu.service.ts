import { v4 as uuidv4 } from "uuid";
import { execute, queryOne, queryRows } from "../../../repositories/base.repository.js";
import { badRequest, notFound } from "../../../utils/app-error.js";
import { nowSql } from "../../../utils/date.js";
import { buildMenuTree, type MenuRow } from "../common.js";
import { cleanNullable } from "../shared/query.js";

export const listMenus = async () => {
  const rows = await queryRows<MenuRow>(
    `SELECT id, parent_menu_id, name, description, url, \`group\`, icon, display, sort, created_at, updated_at
     FROM app_menus ORDER BY \`group\`, sort, name`,
  );
  return buildMenuTree(rows);
};

export const getMenu = async (id: string) => {
  const row = await queryOne(`SELECT * FROM app_menus WHERE id = ?`, [id]);
  if (!row) throw notFound("Menu tidak ditemukan.");
  return row;
};

export const saveMenu = async (payload: Record<string, unknown>, id?: string) => {
  const now = nowSql();
  const display =
    payload.display === true || payload.display === "1" || payload.display === 1 ? 1 : 0;
  const values: Array<string | number | null> = [
    cleanNullable(payload.parent_menu_id as string | null),
    String(payload.name ?? ""),
    cleanNullable(payload.description as string | null),
    cleanNullable(payload.url as string | null),
    String(payload.group ?? "main"),
    cleanNullable(payload.icon as string | null),
    display,
    Number(payload.sort ?? 0),
    now,
  ];
  if (id) {
    await execute(
      `UPDATE app_menus SET parent_menu_id = ?, name = ?, description = ?, url = ?, \`group\` = ?, icon = ?, display = ?, sort = ?, updated_at = ? WHERE id = ?`,
      [...values, id],
    );
    return getMenu(id);
  }
  const newId = uuidv4();
  await execute(
    `INSERT INTO app_menus (id, parent_menu_id, name, description, url, \`group\`, icon, display, sort, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [newId, ...values, now],
  );
  return getMenu(newId);
};

export const deleteMenu = async (id: string, forceDelete = false) => {
  const row = await getMenu(id);
  const children = await queryRows(`SELECT id FROM app_menus WHERE parent_menu_id = ?`, [id]);
  if (children.length > 0 && !forceDelete) {
    throw badRequest("Menu ini masih memiliki submenu. Aktifkan force delete untuk menghapus seluruh cabang menu.");
  }
  await execute(`DELETE FROM app_menus WHERE id = ?`, [id]);
  return row;
};
