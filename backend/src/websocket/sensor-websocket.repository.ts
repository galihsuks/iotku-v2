import type { RowDataPacket } from "mysql2";
import { queryOne } from "../repositories/base.repository.js";
import { parseValueOptions } from "../modules/sensor/shared/value-options.js";

type SensorSocketRow = RowDataPacket & {
  id: string;
  code: string;
  passkey: string;
};

export const getSensor = async (sensorIdOrCode: string) =>
  queryOne<SensorSocketRow>(
    `SELECT id, code, passkey FROM sensors WHERE id = ? OR code = ? LIMIT 1`,
    [sensorIdOrCode, sensorIdOrCode],
  );

export const getSensorCodes = async (sensorIdsOrCodes: string[]) => {
  const sensorCodes: string[] = [];
  const missing: string[] = [];

  for (const sensorIdOrCode of sensorIdsOrCodes) {
    const sensor = await getSensor(sensorIdOrCode);
    if (!sensor) {
      missing.push(sensorIdOrCode);
      continue;
    }
    sensorCodes.push(sensor.code);
  }

  return { sensorCodes: Array.from(new Set(sensorCodes)), missing };
};

export const getCommandSensor = async (sensorIdOrCode: string) => {
  const sensor = await queryOne<
    RowDataPacket & {
      id: string;
      code: string;
      value_type: "number" | "string";
      value_options: string | null;
    }
  >(
    `SELECT s.id, s.code, u.value_type, u.value_options
     FROM sensors s
     JOIN sensor_units u ON u.id = s.unit_id
     WHERE s.id = ? OR s.code = ?
     LIMIT 1`,
    [sensorIdOrCode, sensorIdOrCode],
  );

  return sensor
    ? {
        ...sensor,
        value_options: parseValueOptions(sensor.value_options),
      }
    : null;
};
