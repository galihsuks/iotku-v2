import type { RowDataPacket } from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { withTransaction } from "../../../config/database.js";
import { execute, queryOne, queryRows } from "../../../repositories/base.repository.js";
import { notFound } from "../../../utils/app-error.js";
import { hashPassword } from "../../../utils/auth.js";
import { nowSql } from "../../../utils/date.js";
import { buildPagination, getPagination } from "../../../utils/pagination.js";
import { like, type KeywordQuery } from "../shared/query.js";

export const listUsers = async (query: KeywordQuery) => {
  const { page, pageSize, offset } = getPagination(query);
  const keywords = query.keywords?.trim() ?? "";
  const where = keywords
    ? "WHERE u.username LIKE ? OR u.full_name LIKE ? OR u.email LIKE ? OR r.name LIKE ?"
    : "";
  const values = keywords ? [like(keywords), like(keywords), like(keywords), like(keywords)] : [];
  const rows = await queryRows(
    `SELECT u.id, u.username, u.full_name, u.email, r.name AS role_name, u.created_at, u.updated_at
     FROM app_users u
     LEFT JOIN app_user_roles ur ON ur.user_id = u.id
     LEFT JOIN app_roles r ON r.id = ur.role_id
     ${where}
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...values, pageSize, offset],
  );
  const count = await queryOne<{ total: number } & RowDataPacket>(
    `SELECT COUNT(*) AS total FROM app_users u LEFT JOIN app_user_roles ur ON ur.user_id = u.id LEFT JOIN app_roles r ON r.id = ur.role_id ${where}`,
    values,
  );
  return { rows, pagination: buildPagination(page, pageSize, Number(count?.total ?? 0)) };
};

export const getUserDetail = async (id: string) => {
  const row = await queryOne<
    RowDataPacket & {
      role_id: string | null;
      role_code: string | null;
      role_name: string | null;
      role_description: string | null;
    }
  >(
    `SELECT u.id, u.username, u.full_name, u.email, u.created_at, u.updated_at,
            r.id AS role_id, r.code AS role_code, r.name AS role_name, r.description AS role_description
     FROM app_users u
     LEFT JOIN app_user_roles ur ON ur.user_id = u.id
     LEFT JOIN app_roles r ON r.id = ur.role_id
     WHERE u.id = ?`,
    [id],
  );
  if (!row) throw notFound("User not found.");
  return {
    id: row.id,
    username: row.username,
    full_name: row.full_name,
    email: row.email,
    created_at: row.created_at,
    updated_at: row.updated_at,
    role: row.role_id
      ? {
          id: row.role_id,
          code: row.role_code,
          name: row.role_name,
          description: row.role_description,
        }
      : null,
  };
};

export const createUser = async (payload: {
  username: string;
  full_name: string;
  email: string;
  password: string;
  role_id: string;
}) => {
  const id = uuidv4();
  const now = nowSql();
  const password = await hashPassword(payload.password);
  await withTransaction(async (conn) => {
    await execute(
      `INSERT INTO app_users (id, username, full_name, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, payload.username, payload.full_name, payload.email, password, now, now],
      conn,
    );
    await execute(
      `INSERT INTO app_user_roles (id, user_id, role_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), id, payload.role_id, now, now],
      conn,
    );
  });
  return getUserDetail(id);
};

export const updateUser = async (
  id: string,
  payload: {
    username: string;
    full_name: string;
    email: string;
    password?: string;
    role_id?: string;
  },
) => {
  const now = nowSql();
  await withTransaction(async (conn) => {
    if (payload.password) {
      await execute(
        `UPDATE app_users SET username = ?, full_name = ?, email = ?, password = ?, updated_at = ? WHERE id = ?`,
        [
          payload.username,
          payload.full_name,
          payload.email,
          await hashPassword(payload.password),
          now,
          id,
        ],
        conn,
      );
    } else {
      await execute(
        `UPDATE app_users SET username = ?, full_name = ?, email = ?, updated_at = ? WHERE id = ?`,
        [payload.username, payload.full_name, payload.email, now, id],
        conn,
      );
    }
    if (payload.role_id) {
      await execute(`DELETE FROM app_user_roles WHERE user_id = ?`, [id], conn);
      await execute(
        `INSERT INTO app_user_roles (id, user_id, role_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), id, payload.role_id, now, now],
        conn,
      );
    }
  });
  return getUserDetail(id);
};

export const deleteUser = async (id: string) => {
  const row = await getUserDetail(id);
  await execute(`DELETE FROM app_users WHERE id = ?`, [id]);
  return row;
};

export const changeUserPassword = async (id: string, password: string) => {
  await execute(`UPDATE app_users SET password = ?, updated_at = ? WHERE id = ?`, [
    await hashPassword(password),
    nowSql(),
    id,
  ]);
};
