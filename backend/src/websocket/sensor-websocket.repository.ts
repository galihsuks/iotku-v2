import type { RowDataPacket } from "mysql2";
import { queryOne } from "../repositories/base.repository.js";

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
