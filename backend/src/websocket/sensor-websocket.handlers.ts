import { WebSocket } from "ws";
import { env } from "../config/env.js";
import { createReading } from "../modules/sensor/reading/sensor-reading.service.js";
import { nowSql } from "../utils/date.js";
import { logWebSocket } from "./sensor-websocket.logger.js";
import { notifyAdminData, notifyAdminLog } from "./sensor-websocket.notifications.js";
import { getSensorCodes } from "./sensor-websocket.repository.js";
import {
  clientSnapshot,
  getActiveDeviceInfo,
  getClient,
  joinRoom,
  leaveRoom,
  roomSnapshot,
} from "./sensor-websocket.registry.js";
import type { SensorWebSocketState } from "./sensor-websocket.types.js";
import { requireSensorArray, sendJson } from "./sensor-websocket.utils.js";

export const handleSubscribe = async (
  state: SensorWebSocketState,
  socket: WebSocket,
  payload: Record<string, unknown>,
) => {
  const sensorIds = requireSensorArray(payload);
  const { sensorCodes, missing } = await getSensorCodes(sensorIds);

  if (missing.length > 0) {
    throw new Error(`Sensor not found: ${missing.join(", ")}.`);
  }

  for (const sensorCode of sensorCodes) {
    joinRoom(socket, sensorCode);
  }

  const subscribedRooms = Array.from(getClient(socket)?.rooms ?? []);
  const info = getClient(socket);
  sendJson(socket, {
    type: "subscribe",
    success: true,
    message: "Subscribed to sensor room.",
    data: { rooms: subscribedRooms },
  });
  notifyAdminData(state, `[${nowSql()}][INFO] Socket subscribed to ${sensorCodes.join(", ")}.`);
  await logWebSocket(
    "info",
    "Socket subscribed to sensor room.",
    { sensor_codes: sensorCodes, rooms: subscribedRooms },
    info?.ip ?? null,
  );
};

export const handleUnsubscribe = async (
  state: SensorWebSocketState,
  socket: WebSocket,
  payload: Record<string, unknown>,
) => {
  const sensorIds = requireSensorArray(payload);
  const { sensorCodes, missing } = await getSensorCodes(sensorIds);

  if (missing.length > 0) {
    throw new Error(`Sensor not found: ${missing.join(", ")}.`);
  }

  for (const sensorCode of sensorCodes) {
    leaveRoom(socket, sensorCode);
  }

  const subscribedRooms = Array.from(getClient(socket)?.rooms ?? []);
  const info = getClient(socket);
  sendJson(socket, {
    type: "unsubscribe",
    success: true,
    message: "Unsubscribed from sensor room.",
    data: { rooms: subscribedRooms },
  });
  notifyAdminData(state, `[${nowSql()}][INFO] Socket unsubscribed from ${sensorCodes.join(", ")}.`);
  await logWebSocket(
    "info",
    "Socket unsubscribed from sensor room.",
    { sensor_codes: sensorCodes, rooms: subscribedRooms },
    info?.ip ?? null,
  );
};

export const handleAdminHandshake = async (
  state: SensorWebSocketState,
  socket: WebSocket,
  payload: Record<string, unknown>,
) => {
  if (!payload.isAdmin || payload.key !== env.WS_ADMIN_KEY) return false;

  if (state.adminSocket?.readyState !== WebSocket.OPEN) {
    state.adminSocket = null;
  }

  if (state.adminSocket && state.adminSocket !== socket) {
    throw new Error("Admin socket is already connected.");
  }

  const info = getClient(socket);
  if (info) info.isAdmin = true;
  state.adminSocket = socket;

  sendJson(socket, {
    type: "admin",
    success: true,
    message: "Admin socket connected.",
    data: { clients: clientSnapshot(), rooms: roomSnapshot() },
  });
  await logWebSocket(
    "info",
    "Admin socket connected.",
    { clients: clientSnapshot(), rooms: roomSnapshot() },
    info?.ip ?? null,
  );
  return true;
};

const getDeviceInfoSensorCodes = async (socket: WebSocket, payload: Record<string, unknown>) => {
  const info = getClient(socket);
  if (!info) throw new Error("Socket is not registered.");

  const requestedSensor = payload.idsensor ?? payload.sensor_code;
  if (Array.isArray(requestedSensor)) {
    const sensorIds = requestedSensor.map((value) => String(value).trim()).filter(Boolean);
    const { sensorCodes, missing } = await getSensorCodes(sensorIds);
    if (missing.length > 0) throw new Error(`Sensor not found: ${missing.join(", ")}.`);
    return sensorCodes;
  }

  if (requestedSensor) {
    const { sensorCodes, missing } = await getSensorCodes([String(requestedSensor)]);
    if (missing.length > 0) throw new Error(`Sensor not found: ${missing.join(", ")}.`);
    return sensorCodes;
  }

  if (info.writeSensorCode) return [info.writeSensorCode];
  return Array.from(info.rooms);
};

export const handleDeviceInfo = async (socket: WebSocket, payload: Record<string, unknown>) => {
  const sensorCodes = await getDeviceInfoSensorCodes(socket, payload);
  const devices = sensorCodes.map((sensorCode) => getActiveDeviceInfo(sensorCode));
  const info = getClient(socket);

  sendJson(socket, {
    type: "device_info",
    success: true,
    message: "Device info loaded.",
    data: devices,
  });
  await logWebSocket(
    "info",
    "Device info requested.",
    { sensor_codes: sensorCodes },
    info?.ip ?? null,
  );
};

export const handleSensorReading = async (
  state: SensorWebSocketState,
  socket: WebSocket,
  payload: Record<string, unknown>,
) => {
  const info = getClient(socket);
  if (!info) throw new Error("Socket is not registered.");
  if (!info.isDevice || !info.writeSensorCode) {
    throw new Error("Only authenticated device sockets can write sensor data.");
  }

  const requestedSensor = payload.idsensor ?? payload.sensor_code;
  if (requestedSensor && String(requestedSensor) !== info.writeSensorCode) {
    throw new Error("Device can only write to the handshake sensor.");
  }

  await createReading(info.writeSensorCode, {
    value: payload.value ?? payload.nilai,
    recorded_at_ms: Number(payload.recorded_at_ms ?? payload.waktu ?? Date.now()),
  });

  notifyAdminLog(state, true, "INFO", info.ip, `Sensor ${info.writeSensorCode} data updated.`);
};
