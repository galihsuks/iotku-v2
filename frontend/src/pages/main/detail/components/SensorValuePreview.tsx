import { Lightbulb, ToggleRight } from "lucide-react";
import type { Sensor } from "../../../../interfaces/sensor";
import { useLatestReadingsBySensor } from "../../../../store/realtimeStore";

interface SensorValuePreviewProps {
  sensor: Sensor;
}

export const SensorValuePreview = ({ sensor }: SensorValuePreviewProps) => {
  const latestReadingsBySensor = useLatestReadingsBySensor();
  const latestReading = latestReadingsBySensor[sensor.code] ?? sensor.latest_reading;
  const isSwitch = sensor.widget_type === "switch";
  const switchEnabled = latestReading?.value === "1" || latestReading?.value === "true";

  return (
    <section className="rounded-2xl border border-dark-200 bg-white p-5 shadow-sm sm:p-6 md:col-span-2">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
            Latest Value
          </p>
          <h2 className="mt-2 text-lg font-semibold text-dark-900">{sensor.unit_name}</h2>
          <p className="mt-1 text-sm text-dark-500">
            Untuk data non-number, tampilan finalnya bisa disesuaikan dari jenis widget.
          </p>
        </div>
        <div className="rounded-2xl border border-light-200 bg-light-50 px-5 py-4 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
            Current
          </p>
          <p className="mt-2 text-2xl font-semibold text-dark-900">
            {isSwitch ? (switchEnabled ? "On" : "Off") : (latestReading?.value ?? "-")}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4">
          <ToggleRight className="h-5 w-5 text-primary-600" />
          <p className="mt-3 text-sm font-semibold text-dark-900">Switch</p>
          <p className="mt-1 text-sm leading-6 text-dark-500">
            Cocok untuk relay, lampu, pompa, atau perangkat on/off.
          </p>
        </div>
        <div className="rounded-2xl border border-light-200 bg-light-50 p-4">
          <Lightbulb className="h-5 w-5 text-dark-600" />
          <p className="mt-3 text-sm font-semibold text-dark-900">Status</p>
          <p className="mt-1 text-sm leading-6 text-dark-500">
            Cocok untuk teks seperti normal, warning, offline, atau mode perangkat.
          </p>
        </div>
        <div className="rounded-2xl border border-light-200 bg-light-50 p-4">
          <Lightbulb className="h-5 w-5 text-dark-600" />
          <p className="mt-3 text-sm font-semibold text-dark-900">Event Log</p>
          <p className="mt-1 text-sm leading-6 text-dark-500">
            Cocok untuk riwayat perubahan state, alarm, atau data kategori.
          </p>
        </div>
      </div>
    </section>
  );
};
