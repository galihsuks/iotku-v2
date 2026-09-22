import type { RowDataPacket } from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { withTransaction } from "../../../config/database.js";
import { execute, queryOne, queryRows } from "../../../repositories/base.repository.js";
import { badRequest, notFound } from "../../../utils/app-error.js";
import { nowSql } from "../../../utils/date.js";
import { buildPagination, getPagination } from "../../../utils/pagination.js";
import { like, type SensorKeywordQuery } from "../shared/query.js";
import { assertCanOwnSensor, assertCanReadSensor } from "../shared/sensor-access.service.js";

export const createSensorCode = async () => {
  const latest = await queryOne<{ code: string } & RowDataPacket>(
    `SELECT code FROM sensors ORDER BY code DESC LIMIT 1`,
  );
  if (!latest) return "00001";
  return `0000${Number(latest.code) + 1}`.slice(-5);
};

export const listSensors = async (query: SensorKeywordQuery, userId: string) => {
  const { page, pageSize, offset } = getPagination(query);
  const keywords = query.keywords?.trim() ?? "";
  const keywordWhere = keywords
    ? "AND (s.code LIKE ? OR s.label LIKE ? OR u.name LIKE ? OR u.unit LIKE ?)"
    : "";
  const values = keywords ? [like(keywords), like(keywords), like(keywords), like(keywords)] : [];
  const rows = await queryRows(
    `SELECT DISTINCT s.id, s.code, s.label, s.passkey, s.owner_user_id, s.unit_id,
            u.name AS unit_name, u.unit, u.value_type, u.widget_type, owner.full_name AS owner_name,
            s.created_at, s.updated_at
     FROM sensors s
     JOIN sensor_units u ON u.id = s.unit_id
     JOIN app_users owner ON owner.id = s.owner_user_id
     LEFT JOIN sensor_shared_users su ON su.sensor_id = s.id
     WHERE (s.owner_user_id = ? OR su.user_id = ?) ${keywordWhere}
     ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
    [userId, userId, ...values, pageSize, offset],
  );
  const count = await queryOne<{ total: number } & RowDataPacket>(
    `SELECT COUNT(DISTINCT s.id) AS total
     FROM sensors s
     JOIN sensor_units u ON u.id = s.unit_id
     LEFT JOIN sensor_shared_users su ON su.sensor_id = s.id
     WHERE (s.owner_user_id = ? OR su.user_id = ?) ${keywordWhere}`,
    [userId, userId, ...values],
  );
  return { rows, pagination: buildPagination(page, pageSize, Number(count?.total ?? 0)) };
};

export const getSensorDetail = async (id: string, userId: string) => {
  await assertCanReadSensor(id, userId);
  const sensor = await queryOne(
    `SELECT s.*, u.name AS unit_name, u.unit, u.value_type, u.widget_type, owner.full_name AS owner_name
     FROM sensors s
     JOIN sensor_units u ON u.id = s.unit_id
     JOIN app_users owner ON owner.id = s.owner_user_id
     WHERE s.id = ?`,
    [id],
  );
  if (!sensor) throw notFound("Sensor not found.");
  const shared_users = await queryRows(
    `SELECT au.id, au.email, au.full_name
     FROM sensor_shared_users su
     JOIN app_users au ON au.id = su.user_id
     WHERE su.sensor_id = ?
     ORDER BY au.full_name`,
    [id],
  );
  return { ...sensor, shared_users };
};

export const saveSensor = async (
  payload: {
    label: string;
    passkey?: string;
    unit_id: string;
    owner_user_id?: string;
    shared_user_ids?: string[];
  },
  currentUserId: string,
  id?: string,
) => {
  const now = nowSql();
  const ownerId = payload.owner_user_id ?? currentUserId;
  if (id) {
    await assertCanOwnSensor(id, currentUserId);
    await withTransaction(async (conn) => {
      await execute(
        `UPDATE sensors SET label = ?, passkey = COALESCE(?, passkey), unit_id = ?, owner_user_id = ?, updated_at = ? WHERE id = ?`,
        [payload.label, payload.passkey ?? null, payload.unit_id, ownerId, now, id],
        conn,
      );
      await execute(`DELETE FROM sensor_shared_users WHERE sensor_id = ?`, [id], conn);
      for (const sharedUserId of payload.shared_user_ids ?? []) {
        await execute(
          `INSERT IGNORE INTO sensor_shared_users (id, sensor_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), id, sharedUserId, now, now],
          conn,
        );
      }
    });
    return getSensorDetail(id, currentUserId);
  }
  const newId = uuidv4();
  const code = await createSensorCode();
  await withTransaction(async (conn) => {
    await execute(
      `INSERT INTO sensors (id, code, label, passkey, unit_id, owner_user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId, code, payload.label, payload.passkey ?? "", payload.unit_id, ownerId, now, now],
      conn,
    );
    for (const sharedUserId of payload.shared_user_ids ?? []) {
      await execute(
        `INSERT IGNORE INTO sensor_shared_users (id, sensor_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), newId, sharedUserId, now, now],
        conn,
      );
    }
  });
  return getSensorDetail(newId, currentUserId);
};

export const joinSensor = async (
  payload: {
    sensor_code: string;
    passkey: string;
  },
  userId: string,
) => {
  const sensor = await queryOne<
    {
      id: string;
      code: string;
      passkey: string;
      owner_user_id: string;
    } & RowDataPacket
  >(`SELECT id, code, passkey, owner_user_id FROM sensors WHERE code = ? LIMIT 1`, [
    payload.sensor_code,
  ]);

  if (!sensor) {
    throw notFound("Sensor not found.");
  }

  if (!sensor.passkey || sensor.passkey !== payload.passkey) {
    throw badRequest("Sensor code or passkey is incorrect.");
  }

  if (sensor.owner_user_id !== userId) {
    const now = nowSql();
    await execute(
      `INSERT IGNORE INTO sensor_shared_users (id, sensor_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), sensor.id, userId, now, now],
    );
  }

  return getSensorDetail(sensor.id, userId);
};

export const deleteSensor = async (id: string, userId: string) => {
  await assertCanOwnSensor(id, userId);
  const row = await getSensorDetail(id, userId);
  await execute(`DELETE FROM sensors WHERE id = ?`, [id]);
  return row;
};
