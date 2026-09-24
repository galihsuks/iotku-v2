import type { RowDataPacket } from "mysql2";
import ExcelJS from "exceljs";
import { v4 as uuidv4 } from "uuid";
import { execute, queryOne, queryRows } from "../../../repositories/base.repository.js";
import { emitSensorReadingCreated } from "../../../events/sensor-reading.events.js";
import { badRequest, notFound } from "../../../utils/app-error.js";
import { nowSql } from "../../../utils/date.js";
import { buildPagination, getPagination } from "../../../utils/pagination.js";
import { assertCanOwnSensor, assertCanReadSensor } from "../shared/sensor-access.service.js";

export const validateReadingValue = async (sensorId: string, value: unknown) => {
  const sensor = await queryOne<{ value_type: "number" | "string" } & RowDataPacket>(
    `SELECT u.value_type FROM sensors s JOIN sensor_units u ON u.id = s.unit_id WHERE s.id = ? OR s.code = ?`,
    [sensorId, sensorId],
  );
  if (!sensor) throw notFound("Sensor tidak ditemukan.");
  const normalized = String(value);
  if (sensor.value_type === "number" && Number.isNaN(Number(normalized.replace(",", ".")))) {
    throw badRequest("Nilai sensor harus berupa angka.");
  }
  return normalized;
};

export const createReading = async (
  sensorIdOrCode: string,
  payload: { recorded_at_ms?: number; value: unknown },
) => {
  const sensor = await queryOne<{ id: string; code: string } & RowDataPacket>(
    `SELECT id, code FROM sensors WHERE id = ? OR code = ?`,
    [sensorIdOrCode, sensorIdOrCode],
  );
  if (!sensor) throw notFound("Sensor tidak ditemukan.");
  const value = await validateReadingValue(sensor.id, payload.value);
  const id = uuidv4();
  await execute(
    `INSERT INTO sensor_readings (id, sensor_id, recorded_at_ms, value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, sensor.id, payload.recorded_at_ms ?? Date.now(), value, nowSql(), nowSql()],
  );
  const reading = await queryOne(`SELECT * FROM sensor_readings WHERE id = ?`, [id]);
  emitSensorReadingCreated({ sensor_code: sensor.code, reading });
  return reading;
};

export const createReadingForUser = async (
  sensorIdOrCode: string,
  payload: { recorded_at_ms?: number; value: unknown },
  userId: string,
) => {
  await assertCanReadSensor(sensorIdOrCode, userId);
  return createReading(sensorIdOrCode, payload);
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

export const exportReadings = async (sensorId: string, userId: string) => {
  await assertCanReadSensor(sensorId, userId);
  const sensor = await queryOne<
    {
      id: string;
      code: string;
      label: string;
      unit_name: string;
      unit: string;
      value_type: string;
      owner_name: string;
    } & RowDataPacket
  >(
    `SELECT s.id, s.code, s.label, u.name AS unit_name, u.unit, u.value_type,
            owner.full_name AS owner_name
     FROM sensors s
     JOIN sensor_units u ON u.id = s.unit_id
     JOIN app_users owner ON owner.id = s.owner_user_id
     WHERE s.id = ?`,
    [sensorId],
  );
  if (!sensor) throw notFound("Sensor tidak ditemukan.");

  const readings = await queryRows<
    {
      id: string;
      recorded_at_ms: number;
      value: string;
      created_at: string | null;
      updated_at: string | null;
    } & RowDataPacket
  >(
    `SELECT id, recorded_at_ms, value, created_at, updated_at
     FROM sensor_readings
     WHERE sensor_id = ?
     ORDER BY recorded_at_ms DESC, created_at DESC`,
    [sensorId],
  );

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Iotku V2";
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet("Sensor Readings");

  worksheet.addRows([
    ["Sensor Code", sensor.code],
    ["Sensor Label", sensor.label],
    ["Unit Name", sensor.unit_name],
    ["Unit", sensor.unit],
    ["Value Type", sensor.value_type],
    ["Owner", sensor.owner_name],
    ["Exported At", new Date()],
    [],
  ]);

  worksheet.getColumn(1).width = 18;
  worksheet.getColumn(2).width = 28;
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(2).font = { bold: true };
  worksheet.getRow(3).font = { bold: true };
  worksheet.getRow(4).font = { bold: true };
  worksheet.getRow(5).font = { bold: true };
  worksheet.getRow(6).font = { bold: true };
  worksheet.getRow(7).font = { bold: true };

  const headerRow = worksheet.addRow(["No", "Recorded At", "Recorded At Ms", "Value", "Unit"]);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE11D48" },
  };
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle" };
  });

  readings.forEach((reading, index) => {
    worksheet.addRow([
      index + 1,
      new Date(reading.recorded_at_ms),
      reading.recorded_at_ms,
      reading.value,
      sensor.unit,
    ]);
  });

  worksheet.columns = [
    { width: 8 },
    { width: 24, style: { numFmt: "dd mmm yyyy hh:mm:ss" } },
    { width: 18 },
    { width: 24 },
    { width: 14 },
  ];
  worksheet.views = [{ state: "frozen", ySplit: 9 }];

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer,
    filename: `sensor-${sensor.code}-readings.xlsx`,
  };
};

export const resetReadings = async (sensorId: string, userId: string) => {
  await assertCanOwnSensor(sensorId, userId);
  const result = await execute(`DELETE FROM sensor_readings WHERE sensor_id = ?`, [sensorId]);

  return {
    deleted_count: result.affectedRows,
  };
};
