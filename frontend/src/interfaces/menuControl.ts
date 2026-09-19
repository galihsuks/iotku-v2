import type { ID } from "./common";

export interface MenuControl {
  id: ID;
  menu_id: ID;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface MenuControlPayload {
  menu_id: ID;
  code: string;
  name: string;
}
