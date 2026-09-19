import type { ID } from "./common";

export interface Role {
  id: ID;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface RolePayload {
  code: string;
  name: string;
  description?: string | null;
}
