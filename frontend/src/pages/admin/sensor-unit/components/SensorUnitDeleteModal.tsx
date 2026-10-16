import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "../../../../components/ui";
import { getApiErrorMessage } from "../../../../api/apiError";
import { useDeleteSensorUnitMutation } from "../../../../api/sensorUnit/sensorUnitQuery";
import type { SensorUnit } from "../../../../interfaces/sensor";
import { useNotificationStore } from "../../../../store/notifStore";

interface SensorUnitDeleteModalProps {
  open: boolean;
  target: SensorUnit | null;
  onClose: () => void;
}

export const SensorUnitDeleteModal = ({ open, target, onClose }: SensorUnitDeleteModalProps) => {
  const queryClient = useQueryClient();
  const addToast = useNotificationStore((state) => state.addToast);
  const deleteMutation = useDeleteSensorUnitMutation();

  const invalidateSensorUnitQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ["sensor-unit"] });
    void queryClient.invalidateQueries({ queryKey: ["dropdown", "sensor-unit"] });
    void queryClient.invalidateQueries({ queryKey: ["sensor"] });
  };

  const confirmDelete = () => {
    if (!target) return;

    deleteMutation.mutate(target.id, {
      onSuccess: (response) => {
        addToast(response.message, "success");
        invalidateSensorUnitQueries();
        onClose();
      },
      onError: (error) => addToast(getApiErrorMessage(error), "error"),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Sensor Unit"
      subtitle="Sensor units cannot be deleted while they are still used by sensors."
      className="max-w-lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="light-outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </div>
      }
    >
      <p className="text-sm text-dark-600">
        Delete <span className="font-semibold text-dark-900">{target?.name}</span>?
      </p>
    </Modal>
  );
};
