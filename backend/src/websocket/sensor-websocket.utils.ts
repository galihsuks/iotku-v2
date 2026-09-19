import { WebSocket } from "ws";

export const sendJson = (socket: WebSocket | null, payload: unknown) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
};

export const parseMessage = (text: string) => {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return JSON.parse(trimmed);
  return { value: text };
};

export const isDeviceFlag = (value: string | null) => value === "1" || value === "true";

export const requireSensorArray = (payload: Record<string, unknown>) => {
  if (!Array.isArray(payload.idsensor)) {
    throw new Error("idsensor must be an array.");
  }

  const sensorIds = payload.idsensor.map((value) => String(value).trim()).filter(Boolean);
  if (sensorIds.length === 0) {
    throw new Error("idsensor cannot be empty.");
  }

  return Array.from(new Set(sensorIds));
};
