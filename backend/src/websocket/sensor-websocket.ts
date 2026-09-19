import { WebSocketServer } from "ws";
import { handleConnection } from "./sensor-websocket.connection.js";
import type { SensorWebSocketState } from "./sensor-websocket.types.js";

export const startSensorWebSocketServer = (port: number) => {
  const server = new WebSocketServer({ port });
  const state: SensorWebSocketState = { adminSocket: null };

  server.on("connection", (socket, req) => {
    void handleConnection(socket, req, state);
  });

  const interval = setInterval(() => {
    for (const socket of server.clients) {
      if (socket.readyState === socket.OPEN) {
        socket.ping();
      }
    }
  }, 30000);

  server.on("close", () => clearInterval(interval));

  server.on("listening", () => {
    console.log(`Sensor WebSocket listening on ws://0.0.0.0:${port}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Sensor WebSocket failed to start: port ${port} is already in use.`);
      return;
    }

    console.error("Sensor WebSocket failed to start.", error);
  });
};
