import type { RowDataPacket } from "mysql2";
import { env } from "../../config/env.js";
import { execute, queryOne } from "../../repositories/base.repository.js";
import { badRequest, notFound, unauthorized } from "../../utils/app-error.js";
import { hashPassword, signAuthToken, verifyPassword } from "../../utils/auth.js";
import { nowSql } from "../../utils/date.js";

interface UserRow extends RowDataPacket {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  password: string | null;
  role_id: string | null;
  role_code: string | null;
  role_name: string | null;
}

export const formatAuthUser = (user: UserRow) => ({
  id: user.id,
  username: user.username,
  full_name: user.full_name,
  email: user.email,
  role: user.role_id
    ? {
        id: user.role_id,
        code: user.role_code,
        name: user.role_name,
      }
    : null,
});

export const getUserWithRoleById = (id: string) =>
  queryOne<UserRow>(
    `SELECT u.id, u.username, u.full_name, u.email, u.password,
            r.id AS role_id, r.code AS role_code, r.name AS role_name
     FROM app_users u
     LEFT JOIN app_user_roles ur ON ur.user_id = u.id
     LEFT JOIN app_roles r ON r.id = ur.role_id
     WHERE u.id = ?
     LIMIT 1`,
    [id],
  );

export const getUserWithRoleByUsername = (username: string) =>
  queryOne<UserRow>(
    `SELECT u.id, u.username, u.full_name, u.email, u.password,
            r.id AS role_id, r.code AS role_code, r.name AS role_name
     FROM app_users u
     LEFT JOIN app_user_roles ur ON ur.user_id = u.id
     LEFT JOIN app_roles r ON r.id = ur.role_id
     WHERE u.username = ? OR u.email = ?
     LIMIT 1`,
    [username, username],
  );

export const login = async (username: string, password: string) => {
  const user = await getUserWithRoleByUsername(username);
  if (!user || !user.password) throw unauthorized("Username or password is incorrect.");

  const valid = await verifyPassword(password, user.password);
  if (!valid) throw unauthorized("Username or password is incorrect.");

  const token = signAuthToken({
    id: user.id,
    email: user.email,
    role: user.role_code,
  });

  await execute(
    `INSERT INTO app_tokens (id, user_id, token, expired_time, created_at, updated_at)
     VALUES (UUID(), ?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY), ?, ?)`,
    [user.id, token, nowSql(), nowSql()],
  );

  return {
    token,
    user: formatAuthUser(user),
  };
};

export const me = async (userId: string) => {
  const user = await getUserWithRoleById(userId);
  if (!user) throw unauthorized("User session is no longer valid.");
  return formatAuthUser(user);
};

export const logout = async (token: string) => {
  if (token) {
    await execute(`DELETE FROM app_tokens WHERE token = ?`, [token]);
  }
};

export const changeOwnPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await getUserWithRoleById(userId);
  if (!user || !user.password) throw notFound("User not found.");

  const valid = await verifyPassword(currentPassword, user.password);
  if (!valid) throw badRequest("Current password is incorrect.");

  const hashed = await hashPassword(newPassword);
  await execute(`UPDATE app_users SET password = ?, updated_at = ? WHERE id = ?`, [
    hashed,
    nowSql(),
    userId,
  ]);
};

export const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  path: "/",
});
