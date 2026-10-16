import { Eye, Wifi, WifiOff } from "lucide-react";
import { Badge, Button, type TableColumn } from "../../../../components/ui";
import type { DeviceInfo, Sensor, SensorReading } from "../../../../interfaces/sensor";

interface AdminSensorTableColumnsParams {
  deviceStatusBySensor: Record<string, DeviceInfo>;
  latestReadingsBySensor: Record<string, SensorReading>;
  onDetail: (sensor: Sensor) => void;
}

const formatDateTime = (timestamp?: number | null) => {
  if (!timestamp) return "-";

  return new Date(timestamp).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getAdminSensorTableColumns = ({
  deviceStatusBySensor,
  latestReadingsBySensor,
  onDetail,
}: AdminSensorTableColumnsParams): TableColumn<Sensor>[] => [
  {
    key: "code",
    header: "Device",
    render: (sensor) => (
      <div>
        <p className="font-semibold text-dark-900">{sensor.label}</p>
        <p className="mt-1 text-xs text-dark-500">{sensor.code}</p>
      </div>
    ),
  },
  {
    key: "unit_name",
    header: "Unit",
    render: (sensor) => (
      <div>
        <p className="font-medium text-dark-800">{sensor.unit_name}</p>
        <p className="mt-1 text-xs text-dark-500">{sensor.unit}</p>
      </div>
    ),
  },
  {
    key: "owner_name",
    header: "Owner",
    render: (sensor) => sensor.owner_name,
  },
  {
    key: "latest_reading",
    header: "Latest Value",
    render: (sensor) => {
      const latestReading = latestReadingsBySensor[sensor.code] ?? sensor.latest_reading;

      return (
        <div>
          <p className="font-semibold text-dark-900">
            {latestReading?.value ?? "-"}
            {latestReading?.value && sensor.unit !== "text" ? (
              <span className="ml-1 text-xs font-medium text-dark-400">{sensor.unit}</span>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-dark-500">
            {formatDateTime(latestReading?.recorded_at_ms)}
          </p>
        </div>
      );
    },
  },
  {
    key: "connection_status",
    header: "Status",
    render: (sensor) => {
      const deviceStatus = deviceStatusBySensor[sensor.code];
      const isOnline = Boolean(deviceStatus?.connection_status);
      const StatusIcon = isOnline ? Wifi : WifiOff;

      return (
        <Badge variant={isOnline ? "success" : "light"} className="gap-1.5">
          <StatusIcon className="h-3 w-3" />
          {isOnline ? "Online" : "Offline"}
        </Badge>
      );
    },
  },
  {
    key: "actions",
    header: "Actions",
    align: "right",
    render: (sensor) => (
      <Button
        type="button"
        variant="primary-outline"
        icon={Eye}
        onClick={() => onDetail(sensor)}
      />
    ),
  },
];
