import { RotateCcw, TriangleAlert } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "../../../../components/ui";
import { queryKeys } from "../../../../api/queryKeys";
import { useResetSensorReadingsMutation } from "../../../../api/sensor/sensorQuery";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import type { Sensor } from "../../../../interfaces/sensor";
import { useNotificationStore } from "../../../../store/notifStore";
import { useRealtimeActions } from "../../../../store/realtimeStore";

interface SensorResetReadingsModalProps {
  open: boolean;
  target: Sensor | null;
  onClose: () => void;
  onReset: () => void;
}

export const SensorResetReadingsModal = ({
  open,
  target,
  onClose,
  onReset,
}: SensorResetReadingsModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { clearLatestReading } = useRealtimeActions();
  const { mutate: resetReadingsMutation, isPending: isResetReadingsPending } =
    useResetSensorReadingsMutation();
  const { handleApiFormError } = useApiFormError({ logEvent: "sensor_readings_reset_failed" });

  const onResetReadings = () => {
    if (!target) return;

    resetReadingsMutation(target.id, {
      onSuccess: (response) => {
        addToast(response.message, "success");
        clearLatestReading(target.code);
        void queryClient.invalidateQueries({ queryKey: ["sensor", "list"] });
        void queryClient.invalidateQueries({ queryKey: queryKeys.sensor.detail(target.id) });
        void queryClient.invalidateQueries({ queryKey: ["sensor", "readings", target.id] });
        onClose();
        onReset();
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
      title="Reset sensor data"
      subtitle="Reset akan menghapus seluruh data pembacaan sensor ini."
      className="max-w-lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="light-outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            icon={RotateCcw}
            loading={isResetReadingsPending}
            onClick={onResetReadings}
          >
            Reset Data
          </Button>
        </div>
      }
    >
      <div className="rounded-2xl border border-warning-200 bg-warning-50 p-4">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-100 text-warning-700">
            <TriangleAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-dark-900">
              Semua data pembacaan <span className="text-danger-700">{target?.label}</span> akan
              dihapus.
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
