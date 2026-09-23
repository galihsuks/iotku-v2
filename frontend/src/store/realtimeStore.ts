import { create } from "zustand";
import type { DeviceInfo, SensorReading } from "../interfaces/sensor";

interface RealtimeState {
  isConnected: boolean;
  subscribedSensorCodes: string[];
  latestReadingsBySensor: Record<string, SensorReading>;
  deviceStatusBySensor: Record<string, DeviceInfo>;
  actions: {
    setConnected: (isConnected: boolean) => void;
    setSubscribedSensorCodes: (sensorCodes: string[]) => void;
    setLatestReading: (sensorCode: string, reading: SensorReading) => void;
    clearLatestReading: (sensorCode: string) => void;
    setDeviceInfo: (deviceInfo: DeviceInfo[]) => void;
  };
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  isConnected: false,
  subscribedSensorCodes: [],
  latestReadingsBySensor: {},
  deviceStatusBySensor: {},
  actions: {
    setConnected: (isConnected) => set({ isConnected }),
    setSubscribedSensorCodes: (subscribedSensorCodes) => set({ subscribedSensorCodes }),
    setLatestReading: (sensorCode, reading) =>
      set((state) => ({
        latestReadingsBySensor: {
          ...state.latestReadingsBySensor,
          [sensorCode]: reading,
        },
      })),
    clearLatestReading: (sensorCode) =>
      set((state) => {
        const next = { ...state.latestReadingsBySensor };
        delete next[sensorCode];

        return { latestReadingsBySensor: next };
      }),
    setDeviceInfo: (deviceInfo) =>
      set((state) => ({
        deviceStatusBySensor: deviceInfo.reduce(
          (acc, item) => ({
            ...acc,
            [item.sensor_code]: item,
          }),
          state.deviceStatusBySensor,
        ),
      })),
  },
}));

export const useRealtimeConnection = () => useRealtimeStore((state) => state.isConnected);
export const useLatestReadingsBySensor = () =>
  useRealtimeStore((state) => state.latestReadingsBySensor);
export const useDeviceStatusBySensor = () =>
  useRealtimeStore((state) => state.deviceStatusBySensor);
export const useRealtimeActions = () => useRealtimeStore((state) => state.actions);
