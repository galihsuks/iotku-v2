import { Activity } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSensorReadingsQuery } from "../../../../api/sensor/sensorQuery";
import type { Sensor, SensorReading } from "../../../../interfaces/sensor";
import { useLatestReadingsBySensor } from "../../../../store/realtimeStore";

interface SensorNumberChartProps {
  sensor: Sensor;
}

const CHART_WIDTH = 720;
const CHART_HEIGHT = 260;
const CHART_PADDING = {
  top: 20,
  right: 18,
  bottom: 42,
  left: 52,
};

const toNumericValue = (value: string) => {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatValue = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);

const mergeReadings = (base: SensorReading[], live: SensorReading[]) => {
  const map = new Map<string, SensorReading>();
  [...base, ...live].forEach((reading) => {
    map.set(reading.id, reading);
  });

  return Array.from(map.values()).sort((a, b) => a.recorded_at_ms - b.recorded_at_ms);
};

export const SensorNumberChart = ({ sensor }: SensorNumberChartProps) => {
  const { data, isPending } = useSensorReadingsQuery(sensor.id, { page: 1, page_size: 100 });
  const latestReadingsBySensor = useLatestReadingsBySensor();
  const latestReading = latestReadingsBySensor[sensor.code];
  const [liveReadings, setLiveReadings] = useState<SensorReading[]>([]);

  useEffect(() => {
    if (!latestReading) return;

    setLiveReadings((prev) => mergeReadings(prev, [latestReading]).slice(-100));
  }, [latestReading]);

  const readings = useMemo(
    () => mergeReadings(data?.data ?? [], liveReadings).slice(-100),
    [data?.data, liveReadings],
  );

  const points = useMemo(
    () =>
      readings
        .map((reading) => ({
          reading,
          value: toNumericValue(reading.value),
        }))
        .filter((item): item is { reading: SensorReading; value: number } => item.value !== null),
    [readings],
  );

  const latestPoint = points.at(-1);
  const minValue = points.length ? Math.min(...points.map((point) => point.value)) : 0;
  const maxValue = points.length ? Math.max(...points.map((point) => point.value)) : 0;
  const valueRange = maxValue - minValue || 1;
  const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const polylinePoints = points
    .map((point, index) => {
      const x =
        CHART_PADDING.left + (points.length <= 1 ? plotWidth : (index / (points.length - 1)) * plotWidth);
      const y =
        CHART_PADDING.top + plotHeight - ((point.value - minValue) / valueRange) * plotHeight;

      return `${x},${y}`;
    })
    .join(" ");
  const xLabels = points.length
    ? [
        points[0],
        points[Math.floor((points.length - 1) / 2)],
        points[points.length - 1],
      ].filter(Boolean)
    : [];

  return (
    <section className="rounded-2xl border border-dark-200 bg-white p-5 shadow-sm sm:p-6 md:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
            Realtime Chart
          </p>
          <h2 className="mt-2 text-lg font-semibold text-dark-900">{sensor.unit_name}</h2>
          <p className="mt-1 text-sm text-dark-500">
            Data historis terakhir akan disambung dengan pembacaan realtime.
          </p>
        </div>
        <div className="rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-500">
            Current
          </p>
          <p className="mt-1 text-2xl font-semibold text-primary-700">
            {latestPoint ? formatValue(latestPoint.value) : "-"}
            <span className="ml-1 text-sm font-medium text-primary-500">{sensor.unit}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-light-200 bg-light-50 p-3">
        {isPending ? (
          <div className="grid h-[260px] place-items-center text-sm text-dark-500">
            Loading chart...
          </div>
        ) : points.length === 0 ? (
          <div className="grid h-[260px] place-items-center text-center">
            <div>
              <Activity className="mx-auto h-8 w-8 text-dark-300" />
              <p className="mt-3 text-sm font-semibold text-dark-800">No numeric readings yet.</p>
              <p className="mt-1 text-sm text-dark-500">
                Chart akan tampil setelah sensor mengirim data angka.
              </p>
            </div>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-[260px] w-full text-primary-600"
            role="img"
            aria-label={`${sensor.label} realtime numeric chart`}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = CHART_PADDING.top + plotHeight * ratio;
              const value = maxValue - valueRange * ratio;

              return (
                <g key={ratio}>
                  <line
                    x1={CHART_PADDING.left}
                    x2={CHART_WIDTH - CHART_PADDING.right}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.08"
                  />
                  <text
                    x={CHART_PADDING.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-dark-400 text-[11px]"
                  >
                    {formatValue(value)}
                  </text>
                </g>
              );
            })}

            <polyline
              fill="none"
              points={polylinePoints}
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            {points.map((point, index) => {
              const x =
                CHART_PADDING.left +
                (points.length <= 1 ? plotWidth : (index / (points.length - 1)) * plotWidth);
              const y =
                CHART_PADDING.top + plotHeight - ((point.value - minValue) / valueRange) * plotHeight;

              return (
                <circle
                  key={point.reading.id}
                  cx={x}
                  cy={y}
                  r={index === points.length - 1 ? 4 : 2.5}
                  className={index === points.length - 1 ? "fill-primary-700" : "fill-primary-400"}
                />
              );
            })}
            {xLabels.map((point, index) => {
              const pointIndex = points.findIndex((item) => item.reading.id === point.reading.id);
              const x =
                CHART_PADDING.left +
                (points.length <= 1 ? plotWidth : (pointIndex / (points.length - 1)) * plotWidth);

              return (
                <text
                  key={`${point.reading.id}-${index}`}
                  x={x}
                  y={CHART_HEIGHT - 12}
                  textAnchor={index === 0 ? "start" : index === xLabels.length - 1 ? "end" : "middle"}
                  className="fill-dark-400 text-[11px]"
                >
                  {formatTime(point.reading.recorded_at_ms)}
                </text>
              );
            })}
          </svg>
        )}
      </div>
    </section>
  );
};
