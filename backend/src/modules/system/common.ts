import type { RowDataPacket } from "mysql2";
import { queryRows } from "../../repositories/base.repository.js";

export interface RoleRow extends RowDataPacket {
  id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MenuRow extends RowDataPacket {
  id: string;
  parent_menu_id: string | null;
  name: string;
  description: string | null;
  url: string | null;
  group: "main" | "system";
  icon: string | null;
  display: number | string | boolean;
  sort: number | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export const buildMenuTree = (menus: MenuRow[]) => {
  const sorted = [...menus].sort((a, b) => {
    const sortDiff = Number(a.sort ?? 0) - Number(b.sort ?? 0);
    return sortDiff === 0 ? String(a.name).localeCompare(String(b.name)) : sortDiff;
  });
  const childrenByParent = new Map<string | null, MenuRow[]>();

  for (const menu of sorted) {
    const parentId = menu.parent_menu_id || null;
    childrenByParent.set(parentId, [...(childrenByParent.get(parentId) ?? []), menu]);
  }

  const buildNode = (menu: MenuRow): Record<string, unknown> => {
    const children = childrenByParent.get(menu.id) ?? [];
    const node: Record<string, unknown> = {
      id: menu.id,
      parent_menu_id: menu.parent_menu_id,
      name: menu.name,
      description: menu.description,
      url: menu.url,
      group: menu.group,
      icon: menu.icon,
      display: String(Number(menu.display) ? "1" : "0"),
      sort: String(menu.sort ?? 0),
    };
    if (children.length > 0) {
      node.chilren = children.map(buildNode);
    }
    return node;
  };

  return (["main", "system"] as const).map((group) => ({
    group,
    group_children: (childrenByParent.get(null) ?? [])
      .filter((menu) => menu.group === group)
      .map(buildNode),
  }));
};

export const getReadableMenuIdsForRoleCode = async (roleCode: string) => {
  const rows = await queryRows<{ menu_id: string } & RowDataPacket>(
    `SELECT DISTINCT rmc.menu_id
     FROM app_role_menu_controls rmc
     JOIN app_roles r ON r.id = rmc.role_id
     JOIN app_menu_controls mc ON mc.id = rmc.menu_control_id
     WHERE r.code = ? AND mc.code = 'R'`,
    [roleCode],
  );
  return rows.map((row) => row.menu_id);
};
