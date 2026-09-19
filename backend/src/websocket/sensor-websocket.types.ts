import type { WebSocket } from "ws";

export type ClientInfo = {
  rooms: Set<string>;
  ip: string | null;
  isDevice: boolean;
  writeSensorCode: string | null;
  connectedAt: string;
  isAdmin: boolean;
};

export type SensorWebSocketState = {
  adminSocket: WebSocket | null;
};
