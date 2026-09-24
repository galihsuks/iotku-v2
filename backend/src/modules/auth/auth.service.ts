import type { RowDataPacket } from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { env } from "../../config/env.js";
import { withTransaction } from "../../config/database.js";
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
  if (!user || !user.password) throw unauthorized("Username atau password salah.");

  const valid = await verifyPassword(password, user.password);
  if (!valid) throw unauthorized("Username atau password salah.");

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

export const signup = async (payload: {
  username: string;
  full_name: string;
  email: string;
  password: string;
}) => {
  const existingUser = await queryOne<{ id: string } & RowDataPacket>(
    `SELECT id FROM app_users WHERE username = ? OR email = ? LIMIT 1`,
    [payload.username, payload.email],
  );
  if (existingUser) throw badRequest("Username atau email sudah terdaftar.");

  const role = await queryOne<{ id: string } & RowDataPacket>(
    `SELECT id FROM app_roles WHERE code = 'U' LIMIT 1`,
  );
  if (!role) throw badRequest("Role user default belum tersedia.");

  const now = nowSql();
  const userId = uuidv4();
  const userRoleId = uuidv4();
  const hashedPassword = await hashPassword(payload.password);

  await withTransaction(async (conn) => {
    await execute(
      `INSERT INTO app_users (id, username, full_name, email, password, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, payload.username, payload.full_name, payload.email, hashedPassword, now, now],
      conn,
    );
    await execute(
      `INSERT INTO app_user_roles (id, user_id, role_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [userRoleId, userId, role.id, now, now],
      conn,
    );
  });

  const createdUser = await getUserWithRoleById(userId);
  if (!createdUser) throw badRequest("Pendaftaran gagal. Silakan coba lagi.");

  const token = signAuthToken({
    id: createdUser.id,
    email: createdUser.email,
    role: createdUser.role_code,
  });

  await execute(
    `INSERT INTO app_tokens (id, user_id, token, expired_time, created_at, updated_at)
     VALUES (UUID(), ?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY), ?, ?)`,
    [createdUser.id, token, nowSql(), nowSql()],
  );

  return {
    token,
    user: formatAuthUser(createdUser),
  };
};

export const me = async (userId: string) => {
  const user = await getUserWithRoleById(userId);
  if (!user) throw unauthorized("Sesi login sudah tidak valid. Silakan login ulang.");
  return formatAuthUser(user);
};

export const updateProfile = async (
  userId: string,
  payload: {
    username: string;
    full_name: string;
    email: string;
  },
) => {
  const currentUser = await getUserWithRoleById(userId);
  if (!currentUser) throw unauthorized("Sesi login sudah tidak valid. Silakan login ulang.");

  const existingUser = await queryOne<{ id: string } & RowDataPacket>(
    `SELECT id FROM app_users WHERE (username = ? OR email = ?) AND id <> ? LIMIT 1`,
    [payload.username, payload.email, userId],
  );
  if (existingUser) throw badRequest("Username atau email sudah digunakan user lain.");

  await execute(
    `UPDATE app_users SET username = ?, full_name = ?, email = ?, updated_at = ? WHERE id = ?`,
    [payload.username, payload.full_name, payload.email, nowSql(), userId],
  );

  const updatedUser = await getUserWithRoleById(userId);
  if (!updatedUser) throw unauthorized("Sesi login sudah tidak valid. Silakan login ulang.");

  return formatAuthUser(updatedUser);
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
  if (!user || !user.password) throw notFound("User tidak ditemukan.");

  const valid = await verifyPassword(currentPassword, user.password);
  if (!valid) throw badRequest("Password saat ini salah.");

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
