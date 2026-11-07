import { WebSocketServer } from "ws";
import { onSensorReadingCreated } from "../events/sensor-reading.events.js";
import { handleConnection } from "./sensor-websocket.connection.js";
import { startWebSocketHeartbeat } from "./sensor-websocket.heartbeat.js";
import { broadcastSensorReading } from "./sensor-websocket.notifications.js";
import type { SensorWebSocketState } from "./sensor-websocket.types.js";

export const startSensorWebSocketServer = (port: number) => {
  const server = new WebSocketServer({ port });
  const state: SensorWebSocketState = { adminSocket: null };
  startWebSocketHeartbeat(server);

  server.on("connection", (socket, req) => {
    void handleConnection(socket, req, state);
  });

  onSensorReadingCreated((event) => {
    broadcastSensorReading(event);
  });

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
