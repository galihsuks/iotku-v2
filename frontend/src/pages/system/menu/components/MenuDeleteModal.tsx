import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Button, Checkbox, Modal } from "../../../../components/ui";
import { useDeleteMenuMutation } from "../../../../api/menu/menuQuery";
import { queryKeys } from "../../../../api/queryKeys";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import { useNotificationStore } from "../../../../store/notifStore";

interface MenuDeleteTarget {
  id: string;
  name: string;
}

interface MenuDeleteModalProps {
  open: boolean;
  target: MenuDeleteTarget | null;
  onClose: () => void;
}

export const MenuDeleteModal = ({ open, target, onClose }: MenuDeleteModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { mutate: deleteMenuMutation, isPending: isDeleteMenuPending } = useDeleteMenuMutation();
  const { handleApiFormError } = useApiFormError({ logEvent: "menu_delete_failed" });
  const [forceDelete, setForceDelete] = useState(false);

  const onDelete = () => {
    if (!target) return;

    deleteMenuMutation(
      { id: target.id, forceDelete },
      {
        onSuccess: (response) => {
          addToast(response.message, "success");
          void queryClient.invalidateQueries({ queryKey: queryKeys.menu.list });
          void queryClient.invalidateQueries({ queryKey: queryKeys.access.menu });
          setForceDelete(false);
          onClose();
        },
        onError: (error) => {
          handleApiFormError(error, {
            menu_id: target.id,
            menu_name: target.name,
            force_delete: forceDelete,
          });
        },
      },
    );
  };

  const handleClose = () => {
    setForceDelete(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Delete menu"
      subtitle="Please confirm before removing this menu."
      className="max-w-lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="light-outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" variant="danger" loading={isDeleteMenuPending} onClick={onDelete}>
            Delete Menu
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
              If this menu still has children or related role access, enable force delete to remove the full menu tree and related access records.
            </p>
          </div>
        </div>
      </div>

      <Checkbox
        checked={forceDelete}
        onChange={setForceDelete}
        className="mt-4 bg-light-50"
        label="Force delete this menu"
        description="Delete all child menus, menu controls, and related role access data in one action."
      />
    </Modal>
  );
};
