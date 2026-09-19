import { nowSql } from "../utils/date.js";
import {
  clientSnapshot,
  getActiveDeviceInfo,
  getRoomSockets,
  roomSnapshot,
} from "./sensor-websocket.registry.js";
import type { SensorWebSocketState } from "./sensor-websocket.types.js";
import { sendJson } from "./sensor-websocket.utils.js";

export const notifyAdminData = (state: SensorWebSocketState, message: string) => {
  sendJson(state.adminSocket, {
    type: "data",
    success: true,
    message,
    data: { clients: clientSnapshot(), rooms: roomSnapshot() },
  });
};

export const notifyAdminLog = (
  state: SensorWebSocketState,
  success: boolean,
  level: "INFO" | "ERROR",
  ip: string | null,
  message: string,
) => {
  sendJson(state.adminSocket, {
    type: "log",
    success,
    message: `[${nowSql()}][${level}][${ip}] ${message}`,
  });
};

export const broadcastDeviceInfo = (sensorCode: string) => {
  const deviceInfo = getActiveDeviceInfo(sensorCode);

  for (const socket of getRoomSockets(sensorCode)) {
    sendJson(socket, {
      type: "device_info",
      success: true,
      message: "Device info updated.",
      data: [deviceInfo],
    });
  }
};
