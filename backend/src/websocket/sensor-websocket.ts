import { WebSocketServer, WebSocket } from "ws";
import { env } from "../config/env.js";
import { execute } from "../repositories/base.repository.js";
import { createReading } from "../modules/sensor/reading/sensor-reading.service.js";
import { nowSql } from "../utils/date.js";

type ClientInfo = {
  sensorCode: string;
  ip: string | null;
  isDevice: string | null;
  connectedAt: string;
};

const clients = new Map<WebSocket, ClientInfo>();
const rooms = new Map<string, Set<WebSocket>>();
let adminSocket: WebSocket | null = null;

const sendJson = (socket: WebSocket | null, payload: unknown) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
};

const logWebSocket = async (
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

const roomSnapshot = () =>
  Array.from(rooms.entries()).map(([room_id, sockets]) => ({
    room_id,
    size: sockets.size,
  }));

const clientSnapshot = () =>
  Array.from(clients.entries()).map(([socket, info]) => ({
    sensor_code: info.sensorCode,
    ip: info.ip,
    is_device: info.isDevice,
    created_at: info.connectedAt,
    ready_state: socket.readyState,
  }));

export const startSensorWebSocketServer = (port: number) => {
  const server = new WebSocketServer({ port });

  server.on("connection", (socket, req) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const sensorCode =
      url.searchParams.get("idsensor") || url.searchParams.get("sensor_code") || "XXXXX";
    const isDevice = url.searchParams.get("is_device");
    const ip =
      String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? "").split(",")[0] ||
      null;
    const connectedAt = nowSql();

    clients.set(socket, { sensorCode, ip, isDevice, connectedAt });
    rooms.set(sensorCode, rooms.get(sensorCode) ?? new Set());
    rooms.get(sensorCode)?.add(socket);

    sendJson(adminSocket, {
      type: "data",
      success: true,
      message: `[${connectedAt}][INFO][${ip}] Connected to WebSocket server.`,
      data: { clients: clientSnapshot(), rooms: roomSnapshot() },
    });

    socket.on("message", (raw) => {
      void (async () => {
        const text = raw.toString();
        try {
          const parsed = text.includes("{") ? JSON.parse(text) : { value: text };

          if (parsed.isAdmin && parsed.key === env.WS_ADMIN_KEY) {
            adminSocket = socket;
            sendJson(socket, {
              type: "admin",
              success: true,
              message: "Admin socket connected.",
              data: { clients: clientSnapshot(), rooms: roomSnapshot() },
            });
            return;
          }

          if (parsed.type === "device_info") {
            sendJson(socket, {
              success: true,
              message: `Sensor ${sensorCode} info loaded.`,
              data: {
                connection_status: true,
                ip_device: ip,
                connected_at: connectedAt,
              },
            });
            return;
          }

          const reading = await createReading(sensorCode, {
            value: parsed.value ?? parsed.nilai,
            recorded_at_ms: parsed.recorded_at_ms ?? parsed.waktu ?? Date.now(),
          });

          const payload = {
            success: true,
            message: "Sensor data updated.",
            data: reading,
            sensor_code: sensorCode,
          };

          for (const client of rooms.get(sensorCode) ?? []) {
            sendJson(client, payload);
          }
          sendJson(adminSocket, {
            type: "log",
            success: true,
            message: `[${nowSql()}][INFO][${ip}] Sensor ${sensorCode} data updated.`,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "WebSocket error.";
          sendJson(socket, { success: false, message });
          sendJson(adminSocket, {
            type: "log",
            success: false,
            message: `[${nowSql()}][ERROR][${ip}] ${message}`,
          });
          await logWebSocket("error", message, { raw: text }, ip);
        }
      })();
    });

    socket.on("close", () => {
      rooms.get(sensorCode)?.delete(socket);
      if (rooms.get(sensorCode)?.size === 0) rooms.delete(sensorCode);
      clients.delete(socket);
      if (adminSocket === socket) adminSocket = null;
      sendJson(adminSocket, {
        type: "data",
        success: true,
        message: `[${nowSql()}][INFO][${ip}] Socket disconnected.`,
        data: { clients: clientSnapshot(), rooms: roomSnapshot() },
      });
    });
  });

  const interval = setInterval(() => {
    for (const socket of server.clients) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.ping();
      }
    }
  }, 30000);

  server.on("close", () => clearInterval(interval));
  console.log(`Sensor WebSocket listening on ws://0.0.0.0:${port}`);
};
