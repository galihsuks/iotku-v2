import { Check, Copy, RadioTower, Thermometer, ToggleRight, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui";
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
  const [copied, setCopied] = useState(false);
  const latestReadingsBySensor = useLatestReadingsBySensor();
  const deviceStatusBySensor = useDeviceStatusBySensor();
  const latestReading = latestReadingsBySensor[sensor.code] ?? sensor.latest_reading;
  const deviceStatus = deviceStatusBySensor[sensor.code];
  const Icon = getWidgetIcon(sensor.widget_type);
  const detailPath = `/detail/${sensor.id}`;
  const openDetail = () => navigate(detailPath);
  const StatusIcon = deviceStatus?.connection_status ? Wifi : WifiOff;

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopyCode = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await navigator.clipboard.writeText(sensor.code);
    setCopied(true);
  };

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
      className="cursor-pointer rounded-2xl border border-dark-200 bg-white p-4 md:p-5 shadow-sm transition hover:border-primary-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-200"
    >
      <div className="flex items-start justify-between gap-2 md:gap-5">
        <div className="flex gap-3">
          <div className="hidden md:block">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="flex-1">
            <p className="w-full text-sm md:text-base font-semibold text-dark-900 line-clamp-2">
              {sensor.label}
            </p>
            <button
              type="button"
              aria-label={copied ? "Sensor code copied" : "Copy sensor code"}
              onClick={handleCopyCode}
              onKeyDown={(event) => event.stopPropagation()}
              className="mt-1 group flex items-center text-dark-400 transition hover:text-dark-700"
            >
              <p className="text-xs text-dark-500">{sensor.code}</p>
              <span
                className={
                  "inline-flex h-6 w-6 md:w-0 transition duration-100 ease-in-out group-hover:w-6 overflow-hidden items-center justify-center opacity-70"
                }
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </span>
            </button>
          </div>
        </div>
        <div>
          <div
            className={
              deviceStatus?.connection_status
                ? "flex h-6 w-6 items-center justify-center text-success-500"
                : "flex h-6 w-6 items-center justify-center text-dark-500"
            }
          >
            <StatusIcon className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="mt-3 md:mt-5">
        {sensor.widget_type === "switch" ? (
          <div onClick={(event) => event.stopPropagation()}>
            <Button type="button" variant="primary-outline" icon={ToggleRight}>
              {latestReading?.value === "1" || latestReading?.value === "true" ? "On" : "Off"}
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-2xl md:text-4xl font-semibold tracking-tight text-dark-900 line-clamp-2">
              {latestReading?.value ?? "-"}
              {sensor.unit != "text" && (
                <span className="ml-2 text-sm md:text-base font-medium text-dark-400">
                  {sensor.unit}
                </span>
              )}
            </p>
            <p className="mt-2 text-[11px] md:text-xs text-dark-500">{sensor.unit_name}</p>
          </div>
        )}
      </div>
    </article>
  );
};
