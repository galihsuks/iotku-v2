import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Button } from "../../../components/ui";
import InternalServerError from "../../../components/templates/InternalServerError";
import { useSensorDetailQuery } from "../../../api/sensor/sensorQuery";
import { useSensorSocket } from "../../../hooks/useSensorSocket";
import type { Sensor } from "../../../interfaces/sensor";
import { useUser } from "../../../store/authStore";
import { SensorNumberChart } from "./components/SensorNumberChart";
import { SensorConnectionStatus } from "./components/SensorConnectionStatus";
import { SensorDeleteModal } from "./components/SensorDeleteModal";
import { SensorValuePreview } from "./components/SensorValuePreview";

export const DetailPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const user = useUser();
  const [deleteTarget, setDeleteTarget] = useState<Sensor | null>(null);
  const { data, isPending, error } = useSensorDetailQuery(id);
  const sensor = data?.data;
  const isOwner = Boolean(sensor && user?.id === sensor.owner_user_id);
  const sensorCodes = sensor?.code ? [sensor.code] : [];

  useSensorSocket(sensorCodes);

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
        badges={[
          {
            text: sensor?.unit_name ?? "",
            variant: "primary-outline",
          },
          {
            text: isOwner ? "Owner" : "Shared",
            variant: isOwner ? "success" : "light",
          },
        ]}
        rightElement={
          isOwner && sensor ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="link"
                link={`/edit/${sensor.id}`}
                variant="primary-outline"
                icon={Pencil}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="danger"
                icon={Trash2}
                onClick={() => setDeleteTarget(sensor)}
              >
                Delete
              </Button>
            </div>
          ) : null
        }
      />

      {isPending || !sensor ? (
        <div className="rounded-2xl border border-dark-200 bg-white p-6 text-sm text-dark-500">
          Loading sensor detail...
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          <SensorConnectionStatus sensor={sensor} />
          <div className="rounded-2xl border border-dark-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
              Access
            </p>
            <h2 className="mt-3 text-xl font-semibold text-dark-900">{sensor.owner_name}</h2>
            <p className="mt-1 text-sm text-dark-500">Owner</p>
            <div className="mt-4">
              <p className="text-sm font-medium text-dark-700">Shared users</p>
              <p className="mt-1 text-sm text-dark-500">
                {sensor.shared_users?.length
                  ? sensor.shared_users.map((item) => item.full_name).join(", ")
                  : "No shared users yet."}
              </p>
            </div>
          </div>
          {sensor.value_type === "number" ? (
            <SensorNumberChart sensor={sensor} />
          ) : (
            <SensorValuePreview sensor={sensor} />
          )}
        </section>
      )}

      <SensorDeleteModal
        open={Boolean(deleteTarget)}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={() => navigate("/", { replace: true })}
      />
    </>
  );
};
