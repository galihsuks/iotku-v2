import type { SensorSocketMessage } from "../../interfaces/sensor";
import { useRealtimeStore } from "../../store/realtimeStore";
import { useNotificationStore } from "../../store/notifStore";
import envVar from "../../utils/envReader";

let socket: WebSocket | null = null;

const handleMessage = (event: MessageEvent<string>) => {
  const actions = useRealtimeStore.getState().actions;
  const payload = JSON.parse(event.data) as SensorSocketMessage;

  if (payload.type === "sensor_reading") {
    actions.setLatestReading(payload.data.sensor_code, payload.data.reading);
  }

  if (payload.type === "device_info") {
    actions.setDeviceInfo(payload.data);
  }

  if (payload.type === "command") {
    useNotificationStore
      .getState()
      .addToast(payload.message, payload.success ? "success" : "error");
  }
};

export const sensorSocket = {
  connect: () => {
    if (socket && socket.readyState <= WebSocket.OPEN) return socket;

    socket = new WebSocket(envVar.WS_URL);
    socket.addEventListener("open", () => useRealtimeStore.getState().actions.setConnected(true));
    socket.addEventListener("close", () => useRealtimeStore.getState().actions.setConnected(false));
    socket.addEventListener("message", handleMessage);
    return socket;
  },
  subscribe: (sensorCodes: string[]) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || sensorCodes.length === 0) return;
    socket.send(JSON.stringify({ type: "subscribe", idsensor: sensorCodes }));
    socket.send(JSON.stringify({ type: "device_info", idsensor: sensorCodes }));
    useRealtimeStore.getState().actions.setSubscribedSensorCodes(sensorCodes);
  },
  unsubscribe: (sensorCodes: string[]) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || sensorCodes.length === 0) return;
    socket.send(JSON.stringify({ type: "unsubscribe", idsensor: sensorCodes }));
  },
  sendCommand: (sensorCode: string, value: string) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify({ type: "command", idsensor: sensorCode, value }));
    return true;
  },
};

