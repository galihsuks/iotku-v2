import type { RowDataPacket } from "mysql2";
import { queryRows } from "../../repositories/base.repository.js";

export const dropdownRoles = async (keywords: string) =>
  queryRows<{ value: string; label: string; code: string } & RowDataPacket>(
    `SELECT id AS value, name AS label, code
     FROM app_roles
     WHERE name LIKE ? OR code LIKE ?
     ORDER BY name
     LIMIT 20`,
    [`%${keywords}%`, `%${keywords}%`],
  );

export const dropdownUsers = async (keywords: string) =>
  queryRows<{ value: string; label: string; email: string | null } & RowDataPacket>(
    `SELECT id AS value,
            CONCAT(COALESCE(full_name, username, email), ' - ', COALESCE(email, '-')) AS label,
            email
     FROM app_users
     WHERE username LIKE ? OR full_name LIKE ? OR email LIKE ?
     ORDER BY full_name
     LIMIT 20`,
    [`%${keywords}%`, `%${keywords}%`, `%${keywords}%`],
  );

export const dropdownSensorUnits = async (keywords: string) =>
  queryRows<
    { value: string; label: string; unit: string; value_type: "number" | "string" } & RowDataPacket
  >(
    `SELECT id AS value,
            CONCAT(name, ' (', unit, ')') AS label,
            unit,
            value_type
     FROM sensor_units
     WHERE name LIKE ? OR unit LIKE ? OR value_type LIKE ?
     ORDER BY name
     LIMIT 20`,
    [`%${keywords}%`, `%${keywords}%`, `%${keywords}%`],
  );

export const dropdownSensors = async (keywords: string, userId: string) =>
  queryRows<{ value: string; label: string; code: string; unit: string } & RowDataPacket>(
    `SELECT DISTINCT s.id AS value,
            CONCAT(s.code, ' - ', s.label) AS label,
            s.code,
            u.unit
     FROM sensors s
     JOIN sensor_units u ON u.id = s.unit_id
     LEFT JOIN sensor_shared_users su ON su.sensor_id = s.id
     WHERE (s.owner_user_id = ? OR su.user_id = ?)
       AND (s.code LIKE ? OR s.label LIKE ? OR u.name LIKE ? OR u.unit LIKE ?)
     ORDER BY s.label
     LIMIT 20`,
    [`${userId}`, `${userId}`, `%${keywords}%`, `%${keywords}%`, `%${keywords}%`, `%${keywords}%`],
  );
