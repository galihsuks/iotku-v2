import { Plus, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Button } from "../../../components/ui";
import InternalServerError from "../../../components/templates/InternalServerError";
import { useSensorListQuery } from "../../../api/sensor/sensorQuery";
import { DEFAULT_PAGE_SIZE } from "../../../constants";
import { useSensorSocket } from "../../../hooks/useSensorSocket";
import { useRealtimeConnection } from "../../../store/realtimeStore";
import { SensorWidgetCard } from "./components/SensorWidgetCard";

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
        badges={[
          {
            text: isConnected ? "Realtime Online" : "Realtime Offline",
            variant: isConnected ? "success" : "light",
          },
        ]}
        rightElement={
          <div className="flex items-center gap-2">
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
          <p className="mt-2 text-sm text-dark-500">
            Tambahkan sensor pertama untuk mulai memantau.
          </p>
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
