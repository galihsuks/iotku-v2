import type { RowDataPacket } from "mysql2";
import { queryOne } from "../../../repositories/base.repository.js";
import { forbidden } from "../../../utils/app-error.js";

export const assertCanReadSensor = async (sensorId: string, userId: string) => {
  const row = await queryOne<{ total: number } & RowDataPacket>(
    `SELECT COUNT(*) AS total
     FROM sensors s
     LEFT JOIN sensor_shared_users su ON su.sensor_id = s.id AND su.user_id = ?
     WHERE s.id = ? AND (s.owner_user_id = ? OR su.user_id IS NOT NULL)`,
    [userId, sensorId, userId],
  );
  if (Number(row?.total ?? 0) === 0) {
    throw forbidden("Kamu tidak punya akses ke sensor ini.");
  }
};

export const assertCanOwnSensor = async (sensorId: string, userId: string) => {
  const row = await queryOne<{ total: number } & RowDataPacket>(
    `SELECT COUNT(*) AS total FROM sensors WHERE id = ? AND owner_user_id = ?`,
    [sensorId, userId],
  );
  if (Number(row?.total ?? 0) === 0) {
    throw forbidden("Hanya owner sensor yang bisa mengubah sensor ini.");
  }
};
