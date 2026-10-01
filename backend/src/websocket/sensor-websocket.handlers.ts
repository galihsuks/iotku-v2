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
  getActiveDeviceSocket,
  getClient,
  joinRoom,
  leaveRoom,
  roomSnapshot,
} from "./sensor-websocket.registry.js";
import type { SensorWebSocketState } from "./sensor-websocket.types.js";
import { requireSensorArray, requireSingleSensor, sendJson } from "./sensor-websocket.utils.js";
import { getCommandSensor } from "./sensor-websocket.repository.js";

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

export const handleCommand = async (
  state: SensorWebSocketState,
  socket: WebSocket,
  payload: Record<string, unknown>,
) => {
  const info = getClient(socket);
  if (!info) throw new Error("Socket is not registered.");
  if (info.isDevice) throw new Error("Device sockets cannot send commands.");

  const requestedSensor = requireSingleSensor(payload);
  const sensor = await getCommandSensor(requestedSensor);
  if (!sensor) throw new Error("Sensor not found.");
  if (!info.rooms.has(sensor.code)) {
    throw new Error("Socket must subscribe to the sensor before sending commands.");
  }

  const value = String(payload.value ?? "").trim();
  if (!value) throw new Error("Command value is required.");

  if (sensor.value_type === "number" && Number.isNaN(Number(value.replace(",", ".")))) {
    throw new Error("Command value must be numeric.");
  }

  if (sensor.value_options.length && !sensor.value_options.some((option) => option.value === value)) {
    throw new Error(`Command value must be one of: ${sensor.value_options.map((option) => option.value).join(", ")}.`);
  }

  const deviceSocket = getActiveDeviceSocket(sensor.code);
  if (!deviceSocket) throw new Error("Device is offline.");

  const command = {
    type: "command",
    success: true,
    message: "Command received.",
    data: {
      sensor_code: sensor.code,
      value,
      requested_at_ms: Date.now(),
    },
  };

  sendJson(deviceSocket, command);
  sendJson(socket, {
    type: "command",
    success: true,
    message: "Command sent to device.",
    data: command.data,
  });
  notifyAdminData(state, `[${nowSql()}][INFO] Command sent to sensor ${sensor.code}.`);
  await logWebSocket(
    "info",
    "Command sent to device.",
    { sensor_code: sensor.code, value },
    info.ip,
  );
};
