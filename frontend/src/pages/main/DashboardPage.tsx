import { Plus, RadioTower, RefreshCw, Thermometer, ToggleRight } from "lucide-react";
import { useMemo } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Badge, Button } from "../../components/ui";
import InternalServerError from "../../components/templates/InternalServerError";
import { useSensorListQuery } from "../../api/sensor/sensorQuery";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import { useSensorSocket } from "../../hooks/useSensorSocket";
import type { Sensor } from "../../interfaces/sensor";
import {
  useDeviceStatusBySensor,
  useLatestReadingsBySensor,
  useRealtimeConnection,
} from "../../store/realtimeStore";

const getWidgetIcon = (widgetType: Sensor["widget_type"]) => {
  if (widgetType === "switch") return ToggleRight;
  if (widgetType === "gauge") return Thermometer;
  return RadioTower;
};

const SensorWidgetCard = ({ sensor }: { sensor: Sensor }) => {
  const latestReadingsBySensor = useLatestReadingsBySensor();
  const deviceStatusBySensor = useDeviceStatusBySensor();
  const latestReading = latestReadingsBySensor[sensor.code];
  const deviceStatus = deviceStatusBySensor[sensor.code];
  const Icon = getWidgetIcon(sensor.widget_type);

  return (
    <article className="rounded-2xl border border-dark-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Icon className="h-5 w-5" />
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
          <Button type="button" variant="primary-outline" icon={ToggleRight}>
            {latestReading?.value === "1" || latestReading?.value === "true" ? "On" : "Off"}
          </Button>
        ) : (
          <div>
            <p className="text-4xl font-semibold tracking-tight text-dark-900">
              {latestReading?.value ?? "-"}
              <span className="ml-2 text-base font-medium text-dark-400">{sensor.unit}</span>
            </p>
            <p className="mt-2 text-xs text-dark-500">{sensor.unit_name}</p>
          </div>
        )}
      </div>
    </article>
  );
};

export const DashboardPage = () => {
  const isConnected = useRealtimeConnection();
  const {
    data: sensorListData,
    isPending,
    error,
  } = useSensorListQuery({ page: 1, page_size: DEFAULT_PAGE_SIZE });
  const sensors = sensorListData?.data ?? [];
  const sensorCodes = useMemo(() => sensors.map((sensor) => sensor.code), [sensors]);

  useSensorSocket(sensorCodes);

  if (error) return <InternalServerError />;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Pantau semua sensor yang kamu miliki atau yang dibagikan ke akunmu."
        breadcrumbs={[{ label: "Main", route: undefined }]}
        rightElement={
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "success" : "light"}>
              {isConnected ? "Realtime Online" : "Realtime Offline"}
            </Badge>
            <Button type="link" link="/add" variant="primary" icon={Plus}>
              Add Sensor
            </Button>
          </div>
        }
      />

      {isPending ? (
        <div className="rounded-2xl border border-dark-200 bg-white p-6 text-sm text-dark-500">
          Loading sensors...
        </div>
      ) : sensors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-dark-200 bg-light-50 p-8 text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-dark-300" />
          <p className="mt-4 font-semibold text-dark-900">No sensor connected yet.</p>
          <p className="mt-2 text-sm text-dark-500">Tambahkan sensor pertama untuk mulai memantau.</p>
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sensors.map((sensor) => (
            <SensorWidgetCard key={sensor.id} sensor={sensor} />
          ))}
        </section>
      )}
    </>
  );
};

