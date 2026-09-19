import type { IncomingMessage } from "http";
import type { RawData, WebSocket } from "ws";
import { nowSql } from "../utils/date.js";
import {
  handleAdminHandshake,
  handleDeviceInfo,
  handleSensorReading,
  handleSubscribe,
  handleUnsubscribe,
} from "./sensor-websocket.handlers.js";
import { logWebSocket } from "./sensor-websocket.logger.js";
import {
  broadcastDeviceInfo,
  notifyAdminData,
  notifyAdminLog,
} from "./sensor-websocket.notifications.js";
import { getSensor } from "./sensor-websocket.repository.js";
import {
  deleteClient,
  getActiveDeviceSocket,
  getClient,
  joinRoom,
  leaveAllRooms,
  registerDeviceSocket,
  setClient,
  unregisterDeviceSocket,
} from "./sensor-websocket.registry.js";
import type { SensorWebSocketState } from "./sensor-websocket.types.js";
import { isDeviceFlag, parseMessage, sendJson } from "./sensor-websocket.utils.js";

const handleHandshake = async (
  socket: WebSocket,
  req: IncomingMessage,
  state: SensorWebSocketState,
) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const handshakeSensor = url.searchParams.get("idsensor") || url.searchParams.get("sensor_code");
  const passkey = url.searchParams.get("passkey") ?? "";
  const isDevice = isDeviceFlag(url.searchParams.get("is_device"));
  const ip =
    String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? "").split(",")[0] || null;
  const connectedAt = nowSql();

  setClient(socket, {
    rooms: new Set(),
    ip,
    isDevice,
    writeSensorCode: null,
    connectedAt,
    isAdmin: false,
  });

  try {
    if (isDevice) {
      if (!handshakeSensor) throw new Error("Device socket requires idsensor.");
      const sensor = await getSensor(handshakeSensor);
      if (!sensor) throw new Error("Sensor not found.");
      if (!sensor.passkey || sensor.passkey !== passkey) throw new Error("Invalid sensor passkey.");
      if (getActiveDeviceSocket(sensor.code)) {
        throw new Error("Device socket for this sensor is already connected.");
      }

      const info = getClient(socket);
      if (info) info.writeSensorCode = sensor.code;
      registerDeviceSocket(sensor.code, socket);
      joinRoom(socket, sensor.code);
      broadcastDeviceInfo(sensor.code);
    } else if (handshakeSensor) {
      const sensor = await getSensor(handshakeSensor);
      if (sensor) joinRoom(socket, sensor.code);
      if (!sensor) {
        sendJson(socket, {
          type: "error",
          success: false,
          message: "Handshake sensor not found.",
        });
      }
    }

    notifyAdminData(state, `[${connectedAt}][INFO][${ip}] Connected to WebSocket server.`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "WebSocket handshake failed.";
    sendJson(socket, { type: "error", success: false, message });
    await logWebSocket(
      "warning",
      message,
      { handshake_sensor: handshakeSensor, is_device: isDevice },
      ip,
    );
    unregisterDeviceSocket(socket);
    leaveAllRooms(socket);
    deleteClient(socket);
    socket.close();
    return false;
  }
};

const handleMessage = async (
  socket: WebSocket,
  state: SensorWebSocketState,
  rawMessage: RawData,
) => {
  const text = rawMessage.toString();
  try {
    const payload = parseMessage(text) as Record<string, unknown>;
    const info = getClient(socket);
    if (!info) throw new Error("Socket is not registered.");

    if (handleAdminHandshake(state, socket, payload)) return;

    if (payload.type === "subscribe") {
      await handleSubscribe(state, socket, payload);
      return;
    }

    if (payload.type === "unsubscribe") {
      await handleUnsubscribe(state, socket, payload);
      return;
    }

    if (payload.type === "device_info") {
      await handleDeviceInfo(socket, payload);
      return;
    }

    await handleSensorReading(state, socket, payload);
  } catch (error) {
    const info = getClient(socket);
    const message = error instanceof Error ? error.message : "WebSocket error.";
    sendJson(socket, { type: "error", success: false, message });
    notifyAdminLog(state, false, "ERROR", info?.ip ?? null, message);
    await logWebSocket("error", message, { raw: text }, info?.ip ?? null);
  }
};

export const handleConnection = async (
  socket: WebSocket,
  req: IncomingMessage,
  state: SensorWebSocketState,
) => {
  const isConnected = await handleHandshake(socket, req, state);
  if (!isConnected) return;

  socket.on("message", (raw) => {
    void handleMessage(socket, state, raw);
  });

  socket.on("close", () => {
    const info = getClient(socket);
    const deviceSensorCode = info?.writeSensorCode;
    unregisterDeviceSocket(socket);
    if (deviceSensorCode) broadcastDeviceInfo(deviceSensorCode);
    leaveAllRooms(socket);
    deleteClient(socket);
    if (state.adminSocket === socket) state.adminSocket = null;
    notifyAdminData(state, `[${nowSql()}][INFO][${info?.ip ?? null}] Socket disconnected.`);
  });
};
