import { useEffect } from "react";
import { sensorSocket } from "../api/websocket/sensorSocket";

export const useSensorSocket = (sensorCodes: string[]) => {
  const sensorCodeKey = sensorCodes.join(",");

  useEffect(() => {
    const socket = sensorSocket.connect();
    const subscribe = () => sensorSocket.subscribe(sensorCodes);

    if (socket.readyState === WebSocket.OPEN) {
      subscribe();
    } else {
      socket.addEventListener("open", subscribe, { once: true });
    }

    return () => {
      socket.removeEventListener("open", subscribe);
      sensorSocket.unsubscribe(sensorCodes);
    };
  }, [sensorCodeKey]);
};

