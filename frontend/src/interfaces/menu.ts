import type { ID } from "./common";

export type MenuGroup = "main" | "system";

export interface Menu {
  id: ID;
  parent_menu_id: ID | null;
  name: string;
  description: string | null;
  url: string | null;
  group: MenuGroup;
  icon: string | null;
  display: boolean | string;
  sort: number | string;
  created_at?: string;
  updated_at?: string;
}

export interface MenuTreeNode {
  id: ID;
  name: string;
  description: string | null;
  url: string | null;
  group: MenuGroup;
  icon: string | null;
  display: string;
  sort: string;
  chilren?: MenuTreeNode[];
}

export interface MenuTreeGroup {
  group: MenuGroup;
  group_children: MenuTreeNode[];
}

export interface MenuPayload {
  parent_menu_id?: ID | null;
  name: string;
  description?: string | null;
  url?: string | null;
  group: MenuGroup;
  icon?: string | null;
  display: 0 | 1 | "0" | "1";
  sort: number;
}
