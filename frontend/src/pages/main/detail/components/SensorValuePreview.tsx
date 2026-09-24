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
  new Date(timestamp).toLocaleString("id-ID", {
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
    () => mergeReadings(data?.data ?? [], page === 1 ? liveReadings : []),
    [data?.data, liveReadings, page],
  );

  const columns: TableColumn<SensorReading>[] = [
    {
      key: "recorded_at_ms",
      header: "Time",
      render: (reading) => formatDateTime(reading.recorded_at_ms),
    },
    {
      key: "value",
      header: "Value",
      render: (reading) => (
        <span className="font-semibold text-dark-900">{formatValue(sensor, reading.value)}</span>
      ),
    },
    {
      key: "unit",
      header: "Unit",
      render: () => sensor.unit || "-",
    },
  ];

  return (
    <section className="rounded-2xl border border-dark-200 bg-white p-5 shadow-sm sm:p-6 md:col-span-2">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
            Latest Value
          </p>
          <h2 className="mt-2 text-lg font-semibold text-dark-900">{sensor.unit_name}</h2>
          <p className="mt-1 text-sm text-dark-500">
            Data non-number ditampilkan sebagai riwayat pembacaan.
          </p>
        </div>
        <div className="rounded-2xl border border-light-200 bg-light-50 px-5 py-4 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Current</p>
          <p className="mt-2 text-2xl font-semibold text-dark-900 max-w-100 truncate">
            {latestReading ? formatValue(sensor, latestReading.value) : "-"}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-light-200 bg-light-50 p-3">
        {isPending ? (
          <div className="grid h-[260px] place-items-center text-sm text-dark-500">
            Loading readings...
          </div>
        ) : readings.length === 0 ? (
          <div className="grid h-[260px] place-items-center text-center">
            <div>
              <RadioTower className="mx-auto h-8 w-8 text-dark-300" />
              <p className="mt-3 text-sm font-semibold text-dark-800">No readings yet.</p>
              <p className="mt-1 text-sm text-dark-500">
                Table akan tampil setelah sensor mengirim data.
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
