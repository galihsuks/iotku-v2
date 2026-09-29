import { Download, EllipsisVertical, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { ActionDropdown, Button } from "../../../components/ui";
import InternalServerError from "../../../components/templates/InternalServerError";
import {
  useExportSensorReadingsMutation,
  useSensorDetailQuery,
} from "../../../api/sensor/sensorQuery";
import { getApiErrorMessage } from "../../../api/apiError";
import { useSensorSocket } from "../../../hooks/useSensorSocket";
import type { Sensor } from "../../../interfaces/sensor";
import { useUser } from "../../../store/authStore";
import { useNotificationStore } from "../../../store/notifStore";
import { SensorNumberChart } from "./components/SensorNumberChart";
import { SensorConnectionStatus } from "./components/SensorConnectionStatus";
import { SensorDeleteModal } from "./components/SensorDeleteModal";
import { SensorResetReadingsModal } from "./components/SensorResetReadingsModal";
import { SensorValuePreview } from "./components/SensorValuePreview";

export const DetailPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const user = useUser();
  const [deleteTarget, setDeleteTarget] = useState<Sensor | null>(null);
  const [resetTarget, setResetTarget] = useState<Sensor | null>(null);
  const [readingsResetVersion, setReadingsResetVersion] = useState(0);
  const exportReadingsMutation = useExportSensorReadingsMutation();
  const addToast = useNotificationStore((state) => state.addToast);
  const { data, isPending, error } = useSensorDetailQuery(id);
  const sensor = data?.data;
  const isOwner = Boolean(sensor && user?.id === sensor.owner_user_id);
  const sensorCodes = sensor?.code ? [sensor.code] : [];

  useSensorSocket(sensorCodes);

  const handleExportReadings = () => {
    if (!sensor) return;

    exportReadingsMutation.mutate(sensor.id, {
      onSuccess: ({ blob, filename }) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(url);
      },
      onError: (exportError) => {
        addToast(getApiErrorMessage(exportError), "error");
      },
    });
  };

  if (error) return <InternalServerError />;

  return (
    <>
      <PageHeader
        showGoBack
        title={sensor?.label ?? "Sensor Detail"}
        subtitle={`ID : ${sensor?.code}`}
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
          sensor ? (
            isOwner ? (
              <ActionDropdown
                icon={EllipsisVertical}
                ariaLabel="Open sensor actions"
                items={[
                  {
                    key: "export-excel",
                    label: "Export Excel",
                    icon: Download,
                    loading: exportReadingsMutation.isPending,
                    onClick: handleExportReadings,
                  },
                  {
                    key: "edit",
                    label: "Edit",
                    icon: Pencil,
                    onClick: () => navigate(`/edit/${sensor.id}`),
                  },
                  {
                    key: "reset-data",
                    label: "Reset Data",
                    icon: RotateCcw,
                    onClick: () => setResetTarget(sensor),
                  },
                  {
                    key: "delete",
                    label: "Delete",
                    icon: Trash2,
                    danger: true,
                    onClick: () => setDeleteTarget(sensor),
                  },
                ]}
              />
            ) : (
              <Button
                type="button"
                variant="success-outline"
                icon={Download}
                loading={exportReadingsMutation.isPending}
                onClick={handleExportReadings}
              >
                Export Excel
              </Button>
            )
          ) : null
        }
      />

      {isPending || !sensor ? (
        <div className="rounded-2xl border border-dark-200 bg-white p-6 text-sm text-dark-500">
          Loading sensor detail...
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {sensor.value_type === "number" ? (
            <SensorNumberChart key={readingsResetVersion} sensor={sensor} />
          ) : (
            <SensorValuePreview sensor={sensor} />
          )}
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
        </section>
      )}

      <SensorDeleteModal
        open={Boolean(deleteTarget)}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={() => navigate("/", { replace: true })}
      />
      <SensorResetReadingsModal
        open={Boolean(resetTarget)}
        target={resetTarget}
        onClose={() => setResetTarget(null)}
        onReset={() => setReadingsResetVersion((prev) => prev + 1)}
      />
    </>
  );
};
