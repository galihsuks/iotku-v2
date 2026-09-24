import { Activity, ChartLine, Table2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSensorReadingsQuery } from "../../../../api/sensor/sensorQuery";
import { DEFAULT_PAGE_SIZE } from "../../../../constants";
import { PaginationControls, Table, type TableColumn } from "../../../../components/ui";
import type { Sensor, SensorReading } from "../../../../interfaces/sensor";
import { useLatestReadingsBySensor } from "../../../../store/realtimeStore";

interface SensorNumberChartProps {
  sensor: Sensor;
}

type ViewMode = "chart" | "table";

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

const formatDateTime = (timestamp: number) =>
  new Date(timestamp).toLocaleString("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
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
  const [page, setPage] = useState(1);
  const { data, isPending } = useSensorReadingsQuery(sensor.id, {
    page,
    page_size: DEFAULT_PAGE_SIZE,
  });
  const latestReadingsBySensor = useLatestReadingsBySensor();
  const latestReading = latestReadingsBySensor[sensor.code];
  const [liveReadings, setLiveReadings] = useState<SensorReading[]>([]);
  const [hoveredReadingId, setHoveredReadingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("chart");

  useEffect(() => {
    if (!latestReading) return;

    setLiveReadings((prev) => mergeReadings(prev, [latestReading]).slice(-100));
  }, [latestReading]);

  useEffect(() => {
    setPage(1);
    setLiveReadings([]);
    setHoveredReadingId(null);
  }, [sensor.id]);

  const readings = useMemo(
    () => mergeReadings(data?.data ?? [], page === 1 ? liveReadings : []),
    [data?.data, liveReadings, page],
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

  const currentReading = latestReading ?? sensor.latest_reading ?? null;
  const currentValue = currentReading ? toNumericValue(currentReading.value) : null;
  const minValue = points.length ? Math.min(...points.map((point) => point.value)) : 0;
  const maxValue = points.length ? Math.max(...points.map((point) => point.value)) : 0;
  const valueRange = maxValue - minValue || 1;
  const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const chartPoints = points.map((point, index) => {
    const x =
      CHART_PADDING.left +
      (points.length <= 1 ? plotWidth : (index / (points.length - 1)) * plotWidth);
    const y = CHART_PADDING.top + plotHeight - ((point.value - minValue) / valueRange) * plotHeight;

    return { ...point, x, y };
  });
  const hoveredPoint =
    chartPoints.find((point) => point.reading.id === hoveredReadingId) ?? chartPoints.at(-1);
  const polylinePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const tooltipWidth = 186;
  const tooltipHeight = 58;
  const tooltipX = hoveredPoint
    ? Math.min(
        CHART_WIDTH - CHART_PADDING.right - tooltipWidth,
        Math.max(CHART_PADDING.left, hoveredPoint.x - tooltipWidth / 2),
      )
    : 0;
  const tooltipY = hoveredPoint
    ? Math.max(CHART_PADDING.top, hoveredPoint.y - tooltipHeight - 14)
    : 0;
  const xLabels = chartPoints.length
    ? [
        chartPoints[0],
        chartPoints[Math.floor((chartPoints.length - 1) / 2)],
        chartPoints[chartPoints.length - 1],
      ].filter(Boolean)
    : [];
  const tableRows = [...chartPoints].reverse();
  const tableColumns: TableColumn<(typeof tableRows)[number]>[] = [
    {
      key: "time",
      header: "Time",
      render: (point) => formatDateTime(point.reading.recorded_at_ms),
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      render: (point) => (
        <span className="font-semibold text-dark-900">{formatValue(point.value)}</span>
      ),
    },
    {
      key: "unit",
      header: "Unit",
      render: () => sensor.unit,
    },
  ];
  const pagination = data?.pagination;

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
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="inline-flex rounded-2xl border border-light-200 bg-light-50 p-1">
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={
                viewMode === "chart"
                  ? "inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-primary-700 shadow-sm"
                  : "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-dark-500 transition hover:text-dark-800"
              }
            >
              <ChartLine className="h-4 w-4" />
              Chart
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={
                viewMode === "table"
                  ? "inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-primary-700 shadow-sm"
                  : "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-dark-500 transition hover:text-dark-800"
              }
            >
              <Table2 className="h-4 w-4" />
              Table
            </button>
          </div>
          <div className="rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-500">
              Current
            </p>
            <p className="mt-1 text-2xl font-semibold text-primary-700">
              {currentValue !== null ? formatValue(currentValue) : "-"}
              <span className="ml-1 text-sm font-medium text-primary-500">{sensor.unit}</span>
            </p>
          </div>
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
        ) : viewMode === "table" ? (
          <Table
            columns={tableColumns}
            data={tableRows}
            loading={isPending}
            emptyText="No numeric readings yet."
            rowKey={(point) => point.reading.id}
            pagination={pagination}
            onPageChange={setPage}
            isInModal
          />
        ) : (
          <>
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="h-[260px] w-full text-primary-600"
              role="img"
              aria-label={`${sensor.label} realtime numeric chart`}
              onMouseLeave={() => setHoveredReadingId(null)}
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
              {chartPoints.map((point, index) => {
                const isActive = point.reading.id === hoveredPoint?.reading.id;

                return (
                  <g key={point.reading.id}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="10"
                      className="fill-transparent"
                      onMouseEnter={() => setHoveredReadingId(point.reading.id)}
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isActive ? 5 : index === chartPoints.length - 1 ? 4 : 2.5}
                      className={
                        isActive || index === chartPoints.length - 1
                          ? "fill-primary-700"
                          : "fill-primary-400"
                      }
                      pointerEvents="none"
                    />
                  </g>
                );
              })}
              {hoveredPoint ? (
                <g pointerEvents="none">
                  <line
                    x1={hoveredPoint.x}
                    x2={hoveredPoint.x}
                    y1={CHART_PADDING.top}
                    y2={CHART_HEIGHT - CHART_PADDING.bottom}
                    stroke="currentColor"
                    strokeDasharray="4 4"
                    strokeOpacity="0.28"
                  />
                  <rect
                    x={tooltipX}
                    y={tooltipY}
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx="10"
                    className="fill-white stroke-primary-100"
                  />
                  <text
                    x={tooltipX + 12}
                    y={tooltipY + 22}
                    className="fill-dark-900 text-[12px] font-semibold"
                  >
                    {formatValue(hoveredPoint.value)} {sensor.unit}
                  </text>
                  <text x={tooltipX + 12} y={tooltipY + 42} className="fill-dark-500 text-[11px]">
                    {formatDateTime(hoveredPoint.reading.recorded_at_ms)}
                  </text>
                </g>
              ) : null}
              {xLabels.map((point, index) => (
                <text
                  key={`${point.reading.id}-${index}`}
                  x={point.x}
                  y={CHART_HEIGHT - 12}
                  textAnchor={
                    index === 0 ? "start" : index === xLabels.length - 1 ? "end" : "middle"
                  }
                  className="fill-dark-400 text-[11px]"
                >
                  {formatTime(point.reading.recorded_at_ms)}
                </text>
              ))}
            </svg>
            {pagination ? (
              <PaginationControls
                pagination={pagination}
                onPageChange={setPage}
                className="mt-3 border-t-0 py-0"
              />
            ) : null}
          </>
        )}
      </div>
    </section>
  );
};
