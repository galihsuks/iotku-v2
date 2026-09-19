import type { ID } from "./common";

export interface RoleMenuAccessItem {
  id: ID;
  name: string;
  checked: boolean;
}

export interface RoleMenuControlItem {
  menu_id: ID;
  menu_name: string;
  menu_description: string | null;
  menu_icon: string | null;
  menu_access: RoleMenuAccessItem[];
  menu_chilren?: RoleMenuControlItem[];
}

export interface RoleMenuControlChangeItem {
  menu_id: ID;
  menu_control_id: ID;
  value: boolean;
}

export interface RoleMenuControlPayload {
  role_id: ID;
  data: RoleMenuControlChangeItem[];
}

export interface RoleMenuControlMutationResult {
  inserted: number;
  deleted: number;
}
