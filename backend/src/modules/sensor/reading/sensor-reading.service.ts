import type { RowDataPacket } from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { execute, queryOne, queryRows } from "../../../repositories/base.repository.js";
import { badRequest, notFound } from "../../../utils/app-error.js";
import { nowSql } from "../../../utils/date.js";
import { buildPagination, getPagination } from "../../../utils/pagination.js";
import { assertCanReadSensor } from "../shared/sensor-access.service.js";

export const validateReadingValue = async (sensorId: string, value: unknown) => {
  const sensor = await queryOne<{ value_type: "number" | "string" } & RowDataPacket>(
    `SELECT u.value_type FROM sensors s JOIN sensor_units u ON u.id = s.unit_id WHERE s.id = ? OR s.code = ?`,
    [sensorId, sensorId],
  );
  if (!sensor) throw notFound("Sensor not found.");
  const normalized = String(value);
  if (sensor.value_type === "number" && Number.isNaN(Number(normalized.replace(",", ".")))) {
    throw badRequest("Data must be a number.");
  }
  return normalized;
};

export const createReading = async (
  sensorIdOrCode: string,
  payload: { recorded_at_ms?: number; value: unknown },
) => {
  const sensor = await queryOne<{ id: string } & RowDataPacket>(
    `SELECT id FROM sensors WHERE id = ? OR code = ?`,
    [sensorIdOrCode, sensorIdOrCode],
  );
  if (!sensor) throw notFound("Sensor not found.");
  const value = await validateReadingValue(sensor.id, payload.value);
  const id = uuidv4();
  await execute(
    `INSERT INTO sensor_readings (id, sensor_id, recorded_at_ms, value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, sensor.id, payload.recorded_at_ms ?? Date.now(), value, nowSql(), nowSql()],
  );
  return queryOne(`SELECT * FROM sensor_readings WHERE id = ?`, [id]);
};

export const listReadings = async (
  sensorId: string,
  query: { page?: unknown; page_size?: unknown },
  userId: string,
) => {
  await assertCanReadSensor(sensorId, userId);
  const { page, pageSize, offset } = getPagination(query);
  const rows = await queryRows(
    `SELECT * FROM sensor_readings WHERE sensor_id = ? ORDER BY recorded_at_ms DESC LIMIT ? OFFSET ?`,
    [sensorId, pageSize, offset],
  );
  const count = await queryOne<{ total: number } & RowDataPacket>(
    `SELECT COUNT(*) AS total FROM sensor_readings WHERE sensor_id = ?`,
    [sensorId],
  );
  return { rows, pagination: buildPagination(page, pageSize, Number(count?.total ?? 0)) };
};
