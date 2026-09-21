import { useParams } from "react-router-dom";
import { PageHeader } from "../../components/layout/PageHeader";
import { Badge } from "../../components/ui";
import InternalServerError from "../../components/templates/InternalServerError";
import { useSensorDetailQuery } from "../../api/sensor/sensorQuery";

export const SensorDetailPage = () => {
  const { id = "" } = useParams();
  const { data, isPending, error } = useSensorDetailQuery(id);
  const sensor = data?.data;

  if (error) return <InternalServerError />;

  return (
    <>
      <PageHeader
        showGoBack
        title={sensor?.label ?? "Sensor Detail"}
        subtitle="Detail sensor, status perangkat, dan data pembacaan akan ditampilkan di sini."
        breadcrumbs={[
          { label: "Main", route: "/" },
          { label: "Detail", route: undefined },
        ]}
      />

      {isPending || !sensor ? (
        <div className="rounded-2xl border border-dark-200 bg-white p-6 text-sm text-dark-500">
          Loading sensor detail...
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-dark-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">Sensor</p>
            <h2 className="mt-3 text-xl font-semibold text-dark-900">{sensor.label}</h2>
            <p className="mt-1 text-sm text-dark-500">{sensor.code}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="primary-outline">{sensor.unit_name}</Badge>
              <Badge variant="secondary-outline">{sensor.widget_type}</Badge>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

