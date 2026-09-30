import { RadioTower } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSensorReadingsQuery } from "../../../../api/sensor/sensorQuery";
import { Table, type TableColumn } from "../../../../components/ui";
import { DEFAULT_PAGE_SIZE } from "../../../../constants";
import type { Sensor, SensorReading } from "../../../../interfaces/sensor";
import { useLatestReadingsBySensor } from "../../../../store/realtimeStore";

interface SensorValuePreviewProps {
  sensor: Sensor;
}

const formatDateTime = (timestamp: number) =>
  new Date(timestamp).toLocaleString("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatValue = (sensor: Sensor, value: string) => {
  if (sensor.widget_type !== "switch") return value;
  if (value === "1" || value === "true") return "On";
  if (value === "0" || value === "false") return "Off";
  return value;
};

const mergeReadings = (base: SensorReading[], live: SensorReading[]) => {
  const map = new Map<string, SensorReading>();
  [...base, ...live].forEach((reading) => {
    map.set(reading.id, reading);
  });

  return Array.from(map.values()).sort((a, b) => b.recorded_at_ms - a.recorded_at_ms);
};

const limitLatestReadings = (readings: SensorReading[], limit: number) => readings.slice(0, limit);

export const SensorValuePreview = ({ sensor }: SensorValuePreviewProps) => {
  const [page, setPage] = useState(1);
  const { data, isPending } = useSensorReadingsQuery(sensor.id, {
    page,
    page_size: DEFAULT_PAGE_SIZE,
  });
  const latestReadingsBySensor = useLatestReadingsBySensor();
  const latestReading = latestReadingsBySensor[sensor.code] ?? sensor.latest_reading;
  const [liveReadings, setLiveReadings] = useState<SensorReading[]>([]);

  useEffect(() => {
    if (!latestReading) return;

    setLiveReadings((prev) => mergeReadings(prev, [latestReading]).slice(0, 100));
  }, [latestReading]);

  useEffect(() => {
    setPage(1);
    setLiveReadings([]);
  }, [sensor.id]);

  const readings = useMemo(
    () => {
      const mergedReadings = mergeReadings(data?.data ?? [], page === 1 ? liveReadings : []);

      return page === 1 ? limitLatestReadings(mergedReadings, DEFAULT_PAGE_SIZE) : mergedReadings;
    },
    [data?.data, liveReadings, page],
  );

  const columns: TableColumn<SensorReading>[] = [
    {
      key: "recorded_at_ms",
      header: "Time",
      render: (reading) => <p className="w-20 md:w-25">{formatDateTime(reading.recorded_at_ms)}</p>,
    },
    {
      key: "value",
      header: "Value",
      render: (reading) => (
        <span className="block min-w-[200px] font-semibold text-dark-900">
          {formatValue(sensor, reading.value)}
        </span>
      ),
    },
    {
      key: "unit",
      header: "Unit",
      render: () => sensor.unit || "-",
    },
  ];

  return (
    <section className="md:col-span-2">
      <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
        Latest Value
      </p>
      <p className="mt-1 text-xs md:text-sm text-dark-500">
        Non-number data is displayed as reading history.
      </p>
      <div className="flex flex-col items-center mt-2 rounded-2xl border border-light-200 bg-light-50 px-5 py-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Current</p>
        <p className="mt-2 text-2xl font-semibold text-dark-900 w-50 md:w-100 truncate">
          {latestReading ? formatValue(sensor, latestReading.value) : "-"}
        </p>
      </div>

      <div className="mt-6 overflow-hidden">
        {isPending ? (
          <div className="grid h-[260px] place-items-center text-sm text-dark-500">
            Loading readings...
          </div>
        ) : readings.length === 0 ? (
          <div className="grid h-[260px] place-items-center text-center">
            <div>
              <RadioTower className="mx-auto h-8 w-8 text-dark-300" />
              <p className="mt-3 text-sm font-semibold text-dark-800">No readings yet.</p>
              <p className="mt-1 text-xs md:text-sm text-dark-500">
                The table will appear after the sensor sends data.
              </p>
            </div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={readings}
            loading={isPending}
            emptyText="No readings yet."
            rowKey={(reading) => reading.id}
            pagination={data?.pagination}
            onPageChange={setPage}
            isInModal
          />
        )}
      </div>
    </section>
  );
};
