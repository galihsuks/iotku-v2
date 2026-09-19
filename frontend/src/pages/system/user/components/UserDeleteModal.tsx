import { AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "../../../../components/ui";
import { useDeleteUserMutation } from "../../../../api/user/userQuery";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import { useNotificationStore } from "../../../../store/notifStore";

interface UserDeleteTarget {
  id: string;
  username: string;
  full_name: string;
}

interface UserDeleteModalProps {
  open: boolean;
  target: UserDeleteTarget | null;
  onClose: () => void;
}

export const UserDeleteModal = ({ open, target, onClose }: UserDeleteModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { mutate: deleteUserMutation, isPending: isDeleteUserPending } = useDeleteUserMutation();
  const { handleApiFormError } = useApiFormError({ logEvent: "user_delete_failed" });

  const onDelete = () => {
    if (!target) return;

    deleteUserMutation(target.id, {
      onSuccess: (response) => {
        addToast(response.message, "success");
        void queryClient.invalidateQueries({ queryKey: ["user"] });
        onClose();
      },
      onError: (error) => {
        handleApiFormError(error, {
          user_id: target.id,
          username: target.username,
        });
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete user"
      subtitle="Please confirm before removing this account."
      className="max-w-lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="light-outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="danger" loading={isDeleteUserPending} onClick={onDelete}>
            Delete User
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
              You are about to delete <span className="text-danger-700">{target?.full_name}</span>.
            </p>
            <p className="mt-1 text-sm text-dark-600">
              Username: <span className="font-medium">{target?.username}</span>
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
