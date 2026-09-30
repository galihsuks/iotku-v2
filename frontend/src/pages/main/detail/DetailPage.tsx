import { Download, EllipsisVertical, Pencil, RotateCcw, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { ActionDropdown, Button, Modal } from "../../../components/ui";
import InternalServerError from "../../../components/templates/InternalServerError";
import { queryKeys } from "../../../api/queryKeys";
import {
  useExportSensorReadingsMutation,
  useSensorDetailQuery,
  useUpdateSensorMutation,
} from "../../../api/sensor/sensorQuery";
import { getApiErrorMessage } from "../../../api/apiError";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useSensorSocket } from "../../../hooks/useSensorSocket";
import type { Sensor } from "../../../interfaces/sensor";
import { useUser } from "../../../store/authStore";
import { useNotificationStore } from "../../../store/notifStore";
import { SensorNumberChart } from "./components/SensorNumberChart";
import { SensorConnectionStatus } from "./components/SensorConnectionStatus";
import { SensorDeleteModal } from "./components/SensorDeleteModal";
import { SensorResetReadingsModal } from "./components/SensorResetReadingsModal";
import { SensorValuePreview } from "./components/SensorValuePreview";

type SharedUser = NonNullable<Sensor["shared_users"]>[number];

export const DetailPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useUser();
  const [deleteTarget, setDeleteTarget] = useState<Sensor | null>(null);
  const [resetTarget, setResetTarget] = useState<Sensor | null>(null);
  const [sharedUserTarget, setSharedUserTarget] = useState<SharedUser | null>(null);
  const [readingsResetVersion, setReadingsResetVersion] = useState(0);
  const exportReadingsMutation = useExportSensorReadingsMutation();
  const updateSensorMutation = useUpdateSensorMutation();
  const addToast = useNotificationStore((state) => state.addToast);
  const { data, isPending, error } = useSensorDetailQuery(id);
  const sensor = data?.data;
  const isOwner = Boolean(sensor && user?.id === sensor.owner_user_id);
  const sensorCodes = sensor?.code ? [sensor.code] : [];

  usePageTitle(sensor?.label ? `${sensor.label} Detail` : "Sensor Detail");
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

  const handleRemoveSharedUser = () => {
    if (!sensor || !sharedUserTarget) return;

    updateSensorMutation.mutate(
      {
        id: sensor.id,
        payload: {
          label: sensor.label,
          unit_id: sensor.unit_id,
          shared_user_ids:
            sensor.shared_users
              ?.filter((item) => item.id !== sharedUserTarget.id)
              .map((item) => item.id) ?? [],
        },
      },
      {
        onSuccess: (response) => {
          addToast(response.message || "Shared user removed successfully.", "success");
          void queryClient.invalidateQueries({ queryKey: queryKeys.sensor.detail(sensor.id) });
          void queryClient.invalidateQueries({ queryKey: ["sensor"] });
          void queryClient.invalidateQueries({ queryKey: ["dropdown", "sensor"] });
          setSharedUserTarget(null);
        },
        onError: (mutationError) => {
          addToast(getApiErrorMessage(mutationError), "error");
        },
      },
    );
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
              <>
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
                  wrapperClassName="hidden md:block"
                />
                <div className="flex md:hidden items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="info"
                    icon={Download}
                    loading={exportReadingsMutation.isPending}
                    onClick={handleExportReadings}
                  />
                  <Button
                    type="button"
                    variant="warning"
                    icon={Pencil}
                    onClick={() => navigate(`/edit/${sensor.id}`)}
                  />
                  <Button
                    type="button"
                    variant="danger"
                    icon={RotateCcw}
                    onClick={() => setResetTarget(sensor)}
                  />
                  <Button
                    type="button"
                    variant="danger"
                    icon={Trash2}
                    onClick={() => setDeleteTarget(sensor)}
                  />
                </div>
              </>
            ) : (
              <Button
                type="button"
                variant="primary"
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
        <div className="rounded-2xl border border-dark-200 bg-white p-6 text-xs md:text-sm text-dark-500">
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
            <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
              Access
            </p>
            <h2 className="mt-1 md:mt-3 leading-6 text-lg md:text-xl font-semibold text-dark-900">
              {sensor.owner_name}
            </h2>
            <p className="mt-1 text-xs md:text-sm text-dark-500">Owner</p>
            <div className="mt-3 md:mt-4">
              <p className="text-xs md:text-sm font-medium text-dark-700">Shared users</p>
              <div className="mt-2 flex flex-col text-xs md:text-sm text-dark-500">
                {sensor.shared_users?.length
                  ? sensor.shared_users.map((item, ind_item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-3 border-light-200 py-2 ${ind_item > 0 ? "border-t" : ""}`}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="shrink-0">
                            <UserRound className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 w-[30vw]">
                            <p className="truncate font-medium text-dark-800">{item.full_name}</p>
                            <p className="truncate text-[10px] text-dark-400">{item.email}</p>
                          </div>
                        </div>
                        {isOwner ? (
                          <Button
                            type="button"
                            variant="danger-text"
                            icon={Trash2}
                            onClick={() => setSharedUserTarget(item)}
                          />
                        ) : null}
                      </div>
                    ))
                  : "No shared users yet."}
              </div>
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
      <Modal
        open={Boolean(sharedUserTarget)}
        onClose={() => setSharedUserTarget(null)}
        title="Remove shared user"
        subtitle="This user will lose access to this sensor."
        className="max-w-lg"
        footer={
          <div className="flex justify-end gap-1 md:gap-3">
            <Button type="button" variant="light-outline" onClick={() => setSharedUserTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={updateSensorMutation.isPending}
              onClick={handleRemoveSharedUser}
            >
              Remove Access
            </Button>
          </div>
        }
      >
        <div className="rounded-2xl border border-danger-100 bg-danger-50 p-4">
          <p className="text-xs md:text-sm font-semibold text-dark-900">
            Remove access for {sharedUserTarget?.full_name}?
          </p>
          <p className="mt-1 text-xs md:text-sm text-dark-600">
            They will no longer be able to view this sensor or receive its realtime data.
          </p>
        </div>
      </Modal>
    </>
  );
};
