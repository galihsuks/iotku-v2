import { WebSocket } from "ws";
import type { ClientInfo } from "./sensor-websocket.types.js";

const clients = new Map<WebSocket, ClientInfo>();
const rooms = new Map<string, Set<WebSocket>>();
const deviceSockets = new Map<string, WebSocket>();

export const setClient = (socket: WebSocket, info: ClientInfo) => {
  clients.set(socket, info);
};

export const getClient = (socket: WebSocket) => clients.get(socket);

export const deleteClient = (socket: WebSocket) => {
  clients.delete(socket);
};

export const getRoomSockets = (sensorCode: string) => rooms.get(sensorCode) ?? new Set();

export const registerDeviceSocket = (sensorCode: string, socket: WebSocket) => {
  deviceSockets.set(sensorCode, socket);
};

export const unregisterDeviceSocket = (socket: WebSocket) => {
  for (const [sensorCode, deviceSocket] of deviceSockets.entries()) {
    if (deviceSocket === socket) {
      deviceSockets.delete(sensorCode);
    }
  }
};

export const getActiveDeviceSocket = (sensorCode: string) => {
  const socket = deviceSockets.get(sensorCode);
  if (!socket) return null;

  if (socket.readyState !== WebSocket.OPEN) {
    deviceSockets.delete(sensorCode);
    return null;
  }

  return socket;
};

export const getActiveDeviceInfo = (sensorCode: string) => {
  const socket = getActiveDeviceSocket(sensorCode);
  if (!socket) {
    return {
      sensor_code: sensorCode,
      connection_status: false,
      ip_device: null,
      connected_at: null,
    };
  }

  const info = clients.get(socket);
  return {
    sensor_code: sensorCode,
    connection_status: true,
    ip_device: info?.ip ?? null,
    connected_at: info?.connectedAt ?? null,
  };
};

export const joinRoom = (socket: WebSocket, sensorCode: string) => {
  const info = clients.get(socket);
  if (!info) return;

  rooms.set(sensorCode, rooms.get(sensorCode) ?? new Set());
  rooms.get(sensorCode)?.add(socket);
  info.rooms.add(sensorCode);
};

export const leaveRoom = (socket: WebSocket, sensorCode: string) => {
  const info = clients.get(socket);
  rooms.get(sensorCode)?.delete(socket);
  if (rooms.get(sensorCode)?.size === 0) rooms.delete(sensorCode);
  info?.rooms.delete(sensorCode);
};

export const leaveAllRooms = (socket: WebSocket) => {
  const info = clients.get(socket);
  if (!info) return;

  for (const sensorCode of Array.from(info.rooms)) {
    leaveRoom(socket, sensorCode);
  }
};

export const roomSnapshot = () =>
  Array.from(rooms.entries()).map(([room_id, sockets]) => ({
    room_id,
    size: sockets.size,
  }));

export const clientSnapshot = () =>
  Array.from(clients.entries()).map(([socket, info]) => ({
    rooms: Array.from(info.rooms),
    ip: info.ip,
    is_device: info.isDevice,
    connection_status: info.isDevice
      ? Boolean(info.writeSensorCode && getActiveDeviceSocket(info.writeSensorCode) === socket)
      : null,
    can_write_sensor_code: info.writeSensorCode,
    created_at: info.connectedAt,
    ready_state: socket.readyState,
  }));
