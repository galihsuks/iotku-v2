import { AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "../../../../components/ui";
import { useDeleteSensorMutation } from "../../../../api/sensor/sensorQuery";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import type { Sensor } from "../../../../interfaces/sensor";
import { useNotificationStore } from "../../../../store/notifStore";

interface SensorDeleteModalProps {
  open: boolean;
  target: Sensor | null;
  onClose: () => void;
  onDeleted: () => void;
}

export const SensorDeleteModal = ({
  open,
  target,
  onClose,
  onDeleted,
}: SensorDeleteModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { mutate: deleteSensorMutation, isPending: isDeleteSensorPending } =
    useDeleteSensorMutation();
  const { handleApiFormError } = useApiFormError({ logEvent: "sensor_delete_failed" });

  const onDelete = () => {
    if (!target) return;

    deleteSensorMutation(target.id, {
      onSuccess: (response) => {
        addToast(response.message, "success");
        void queryClient.invalidateQueries({ queryKey: ["sensor"] });
        void queryClient.invalidateQueries({ queryKey: ["dropdown", "sensor"] });
        onClose();
        onDeleted();
      },
      onError: (error) => {
        handleApiFormError(error, {
          sensor_id: target.id,
          sensor_code: target.code,
        });
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete sensor"
      subtitle="Please confirm before removing this sensor."
      className="max-w-lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="light-outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="danger" loading={isDeleteSensorPending} onClick={onDelete}>
            Delete Sensor
          </Button>
        </div>
      }
    >
      <div className="rounded-2xl border border-warning-200 bg-warning-50 p-4">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-100 text-warning-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-dark-900">
              You are about to delete <span className="text-danger-700">{target?.label}</span>.
            </p>
            <p className="mt-1 text-sm text-dark-600">
              Sensor code: <span className="font-medium">{target?.code}</span>
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
