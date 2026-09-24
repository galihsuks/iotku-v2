import { RadioTower, Thermometer, ToggleRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge, Button } from "../../../../components/ui";
import type { Sensor } from "../../../../interfaces/sensor";
import {
  useDeviceStatusBySensor,
  useLatestReadingsBySensor,
} from "../../../../store/realtimeStore";

const getWidgetIcon = (widgetType: Sensor["widget_type"]) => {
  if (widgetType === "switch") return ToggleRight;
  if (widgetType === "gauge") return Thermometer;
  return RadioTower;
};

interface SensorWidgetCardProps {
  sensor: Sensor;
}

export const SensorWidgetCard = ({ sensor }: SensorWidgetCardProps) => {
  const navigate = useNavigate();
  const latestReadingsBySensor = useLatestReadingsBySensor();
  const deviceStatusBySensor = useDeviceStatusBySensor();
  const latestReading = latestReadingsBySensor[sensor.code] ?? sensor.latest_reading;
  const deviceStatus = deviceStatusBySensor[sensor.code];
  const Icon = getWidgetIcon(sensor.widget_type);
  const detailPath = `/detail/${sensor.id}`;
  const openDetail = () => navigate(detailPath);

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetail();
        }
      }}
      className="cursor-pointer rounded-2xl border border-dark-200 bg-white p-5 shadow-sm transition hover:border-primary-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-dark-900">{sensor.label}</p>
            <p className="mt-1 text-xs text-dark-500">{sensor.code}</p>
          </div>
        </div>
        <Badge variant={deviceStatus?.connection_status ? "success" : "light"}>
          {deviceStatus?.connection_status ? "Online" : "Offline"}
        </Badge>
      </div>

      <div className="mt-5">
        {sensor.widget_type === "switch" ? (
          <div onClick={(event) => event.stopPropagation()}>
            <Button type="button" variant="primary-outline" icon={ToggleRight}>
              {latestReading?.value === "1" || latestReading?.value === "true" ? "On" : "Off"}
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-4xl font-semibold tracking-tight text-dark-900 line-clamp-2">
              {latestReading?.value ?? "-"}
              {sensor.unit != "text" && (
                <span className="ml-2 text-base font-medium text-dark-400">{sensor.unit}</span>
              )}
            </p>
            <p className="mt-2 text-xs text-dark-500">{sensor.unit_name}</p>
          </div>
        )}
      </div>
    </article>
  );
};
