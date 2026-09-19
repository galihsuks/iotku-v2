import { AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "../../../../components/ui";
import { useDeleteParameterMutation } from "../../../../api/parameter/parameterQuery";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import { useNotificationStore } from "../../../../store/notifStore";

interface ParameterDeleteTarget {
  id: string;
  key: string;
  datatype: string;
}

interface ParameterDeleteModalProps {
  open: boolean;
  target: ParameterDeleteTarget | null;
  onClose: () => void;
}

export const ParameterDeleteModal = ({
  open,
  target,
  onClose,
}: ParameterDeleteModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { mutate: deleteParameterMutation, isPending: isDeleteParameterPending } =
    useDeleteParameterMutation();
  const { handleApiFormError } = useApiFormError({ logEvent: "parameter_delete_failed" });

  const onDelete = () => {
    if (!target) return;

    deleteParameterMutation(target.id, {
      onSuccess: (response) => {
        addToast(response.message, "success");
        void queryClient.invalidateQueries({ queryKey: ["parameter"] });
        onClose();
      },
      onError: (error) => {
        handleApiFormError(error, {
          parameter_id: target.id,
          parameter_key: target.key,
        });
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete parameter"
      subtitle="Please confirm before removing this parameter."
      className="max-w-lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="light-outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="danger" loading={isDeleteParameterPending} onClick={onDelete}>
            Delete Parameter
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
              You are about to delete <span className="text-danger-700">{target?.key}</span>.
            </p>
            <p className="mt-1 text-sm text-dark-600">
              Datatype: <span className="font-medium capitalize">{target?.datatype}</span>
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
