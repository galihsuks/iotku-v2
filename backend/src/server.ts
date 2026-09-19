import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { startSensorWebSocketServer } from "./websocket/sensor-websocket.js";

const app = createApp();
const httpServer = createServer(app);

httpServer.listen(env.PORT, "0.0.0.0", () => {
  console.log(`${env.APP_NAME} listening on http://0.0.0.0:${env.PORT}`);
});

startSensorWebSocketServer(env.WS_PORT);
