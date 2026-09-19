import { execute } from "../repositories/base.repository.js";
import { nowSql } from "../utils/date.js";

export const logWebSocket = async (
  level: "info" | "warning" | "error",
  message: string,
  context: unknown,
  ip: string | null,
) => {
  try {
    await execute(
      `INSERT INTO websocket_logs (level, message, context, ip_address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [level, message, JSON.stringify(context ?? {}), ip, nowSql(), nowSql()],
    );
  } catch (error) {
    console.error(error);
  }
};
