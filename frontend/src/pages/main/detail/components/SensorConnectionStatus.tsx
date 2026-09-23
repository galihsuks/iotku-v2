import { Clock3, Globe2, Wifi, WifiOff } from "lucide-react";
import { Badge } from "../../../../components/ui";
import type { Sensor } from "../../../../interfaces/sensor";
import { useDeviceStatusBySensor, useRealtimeConnection } from "../../../../store/realtimeStore";

interface SensorConnectionStatusProps {
  sensor: Sensor;
}

const formatConnectedAt = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const SensorConnectionStatus = ({ sensor }: SensorConnectionStatusProps) => {
  const isRealtimeConnected = useRealtimeConnection();
  const deviceStatusBySensor = useDeviceStatusBySensor();
  const deviceStatus = deviceStatusBySensor[sensor.code];
  const isOnline = Boolean(deviceStatus?.connection_status);
  const StatusIcon = isOnline ? Wifi : WifiOff;

  return (
    <div className="rounded-2xl border border-dark-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
            Device Status
          </p>
          <h2 className="mt-3 text-xl font-semibold text-dark-900">
            {isOnline ? "Online" : "Offline"}
          </h2>
          <p className="mt-1 text-sm text-dark-500">
            {isOnline
              ? "Perangkat sedang terhubung ke WebSocket."
              : "Belum ada socket device aktif untuk sensor ini."}
          </p>
        </div>
        <div>
          <div
            className={
              isOnline
                ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-success-50 text-success-500"
                : "flex h-11 w-11 items-center justify-center rounded-2xl bg-light-100 text-dark-500"
            }
          >
            <StatusIcon className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant={isOnline ? "success" : "light"}>
          {isOnline ? "Device Online" : "Device Offline"}
        </Badge>
        <Badge variant={isRealtimeConnected ? "primary-outline" : "light"}>
          {isRealtimeConnected ? "Realtime Connected" : "Realtime Disconnected"}
        </Badge>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-light-200 bg-light-50 px-4 py-3">
          <Globe2 className="h-4 w-4 text-dark-500" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
              IP Device
            </p>
            <p className="mt-1 text-sm font-medium text-dark-800">
              {deviceStatus?.ip_device ?? "-"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-light-200 bg-light-50 px-4 py-3">
          <Clock3 className="h-4 w-4 text-dark-500" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
              Connected At
            </p>
            <p className="mt-1 text-sm font-medium text-dark-800">
              {formatConnectedAt(deviceStatus?.connected_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
