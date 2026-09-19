import type { RowDataPacket } from "mysql2";
import { queryRows } from "../../../repositories/base.repository.js";
import { buildMenuTree, type MenuRow } from "../common.js";

export const listReadableMenus = async (roleCode: string) => {
  const rows = await queryRows<MenuRow>(
    `SELECT DISTINCT m.id, m.parent_menu_id, m.name, m.description, m.url, m.\`group\`, m.icon, m.display, m.sort
     FROM app_menus m
     JOIN app_role_menu_controls rmc ON rmc.menu_id = m.id
     JOIN app_roles r ON r.id = rmc.role_id
     JOIN app_menu_controls mc ON mc.id = rmc.menu_control_id
     WHERE r.code = ? AND mc.code = 'R' AND m.display = 1
     ORDER BY m.\`group\`, m.sort, m.name`,
    [roleCode],
  );
  return buildMenuTree(rows);
};

export const listControlCodes = async (roleCode: string, menuId: string) => {
  const rows = await queryRows<{ code: string } & RowDataPacket>(
    `SELECT DISTINCT mc.code
     FROM app_role_menu_controls rmc
     JOIN app_roles r ON r.id = rmc.role_id
     JOIN app_menu_controls mc ON mc.id = rmc.menu_control_id
     WHERE r.code = ? AND rmc.menu_id = ?
     ORDER BY mc.code`,
    [roleCode, menuId],
  );
  return rows.map((row) => row.code);
};
