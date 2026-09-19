import type { RowDataPacket } from "mysql2";
import { queryRows } from "../../../repositories/base.repository.js";

export const dropdownRoles = async (keywords: string) =>
  queryRows<{ value: string; label: string } & RowDataPacket>(
    `SELECT id AS value, name AS label FROM app_roles WHERE name LIKE ? OR code LIKE ? ORDER BY name LIMIT 20`,
    [`%${keywords}%`, `%${keywords}%`],
  );

export const dropdownUsers = async (keywords: string) =>
  queryRows<{ value: string; label: string } & RowDataPacket>(
    `SELECT id AS value, CONCAT(COALESCE(full_name, username, email), ' - ', COALESCE(email, '-')) AS label
     FROM app_users
     WHERE username LIKE ? OR full_name LIKE ? OR email LIKE ?
     ORDER BY full_name LIMIT 20`,
    [`%${keywords}%`, `%${keywords}%`, `%${keywords}%`],
  );
