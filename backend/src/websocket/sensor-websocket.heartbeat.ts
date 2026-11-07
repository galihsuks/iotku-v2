import { WebSocket, type WebSocketServer } from "ws";

export const startWebSocketHeartbeat = (server: WebSocketServer, intervalMs = 30000) => {
  const aliveSockets = new WeakSet<WebSocket>();

  server.on("connection", (socket) => {
    aliveSockets.add(socket);
    socket.on("pong", () => aliveSockets.add(socket));
  });

  const interval = setInterval(() => {
    for (const socket of server.clients) {
      if (socket.readyState !== WebSocket.OPEN) continue;
      if (!aliveSockets.has(socket)) {
        socket.terminate();
        continue;
      }

      aliveSockets.delete(socket);
      socket.ping();
    }
  }, intervalMs);

  server.on("close", () => clearInterval(interval));
};
