import type { ID } from "./common";
import type { Role } from "./role";

export interface UserListItem {
  id: ID;
  username: string;
  full_name: string;
  email: string;
  role_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserDetail {
  id: ID;
  username: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
  role: Role | null;
}

export interface CreateUserPayload {
  username: string;
  full_name: string;
  email: string;
  password: string;
  role_id: ID;
}

export interface UpdateUserPayload {
  username: string;
  full_name: string;
  email: string;
  password?: string;
  role_id?: ID;
}

export interface ChangeOwnPasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangeUserPasswordPayload {
  new_password: string;
  confirm_password: string;
}
