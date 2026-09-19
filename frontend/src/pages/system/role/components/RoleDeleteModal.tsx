import { AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "../../../../components/ui";
import { useDeleteRoleMutation } from "../../../../api/role/roleQuery";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import { useNotificationStore } from "../../../../store/notifStore";

interface RoleDeleteTarget {
  id: string;
  code: string;
  name: string;
}

interface RoleDeleteModalProps {
  open: boolean;
  target: RoleDeleteTarget | null;
  onClose: () => void;
}

export const RoleDeleteModal = ({ open, target, onClose }: RoleDeleteModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { mutate: deleteRoleMutation, isPending: isDeleteRolePending } = useDeleteRoleMutation();
  const { handleApiFormError } = useApiFormError({ logEvent: "role_delete_failed" });

  const onDelete = () => {
    if (!target) return;

    deleteRoleMutation(target.id, {
      onSuccess: (response) => {
        addToast(response.message, "success");
        void queryClient.invalidateQueries({ queryKey: ["role"] });
        onClose();
      },
      onError: (error) => {
        handleApiFormError(error, {
          role_id: target.id,
          role_code: target.code,
        });
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete role"
      subtitle="Please confirm before removing this role."
      className="max-w-lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="light-outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="danger" loading={isDeleteRolePending} onClick={onDelete}>
            Delete Role
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
              You are about to delete <span className="text-danger-700">{target?.name}</span>.
            </p>
            <p className="mt-1 text-sm text-dark-600">
              Make sure this role is no longer used by your application before continuing.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
