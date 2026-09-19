import type { RowDataPacket } from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { withTransaction } from "../../../config/database.js";
import { execute, queryRows } from "../../../repositories/base.repository.js";
import { nowSql } from "../../../utils/date.js";
import type { MenuRow } from "../common.js";

export const updateRoleMenuControls = async (
  roleId: string,
  changes: Array<{ menu_id: string; menu_control_id: string; value: boolean }>,
) => {
  await withTransaction(async (conn) => {
    for (const change of changes) {
      if (change.value) {
        await execute(
          `INSERT IGNORE INTO app_role_menu_controls (id, role_id, menu_id, menu_control_id, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [uuidv4(), roleId, change.menu_id, change.menu_control_id, nowSql(), nowSql()],
          conn,
        );
      } else {
        await execute(
          `DELETE FROM app_role_menu_controls WHERE role_id = ? AND menu_id = ? AND menu_control_id = ?`,
          [roleId, change.menu_id, change.menu_control_id],
          conn,
        );
      }
    }
  });
  return { changed_items_count: changes.length };
};

export const listRoleAccessTree = async (roleId: string) => {
  const menus = await queryRows<MenuRow>(`SELECT * FROM app_menus ORDER BY \`group\`, sort, name`);
  const controls = await queryRows<
    RowDataPacket & { id: string; menu_id: string; code: string; name: string }
  >(`SELECT id, menu_id, code, name FROM app_menu_controls ORDER BY code ASC`);
  const checked = await queryRows<RowDataPacket & { menu_control_id: string }>(
    `SELECT menu_control_id FROM app_role_menu_controls WHERE role_id = ?`,
    [roleId],
  );
  const checkedIds = new Set(checked.map((row) => row.menu_control_id));
  const controlsByMenu = new Map<string, typeof controls>();
  for (const control of controls) {
    controlsByMenu.set(control.menu_id, [...(controlsByMenu.get(control.menu_id) ?? []), control]);
  }
  const childrenByParent = new Map<string | null, MenuRow[]>();
  for (const menu of menus) {
    const parentId = menu.parent_menu_id || null;
    childrenByParent.set(parentId, [...(childrenByParent.get(parentId) ?? []), menu]);
  }
  const build = (menu: MenuRow): Record<string, unknown> => ({
    menu_id: menu.id,
    menu_name: menu.name,
    menu_description: menu.description,
    menu_access: (controlsByMenu.get(menu.id) ?? []).map((control) => ({
      id: control.id,
      code: control.code,
      name: control.name,
      checked: checkedIds.has(control.id),
    })),
    menu_chilren: (childrenByParent.get(menu.id) ?? []).map(build),
  });
  return (childrenByParent.get(null) ?? []).map(build);
};
