import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button, FormInput, Modal } from "../../../../components/ui";
import {
  useCreateMenuControlMutation,
  useDeleteMenuControlMutation,
  useMenuControlListQuery,
  useUpdateMenuControlMutation,
} from "../../../../api/menuControl/menuControlQuery";
import { queryKeys } from "../../../../api/queryKeys";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import { useNotificationStore } from "../../../../store/notifStore";
import type { MenuControl } from "../../../../interfaces/menuControl";
import { type MenuControlFormSchemaType, menuControlFormSchema } from "../schema/MenuControlFormSchema";

interface MenuControlModalProps {
  open: boolean;
  menuId: string | null;
  menuName: string | null;
  onClose: () => void;
}

export const MenuControlModal = ({ open, menuId, menuName, onClose }: MenuControlModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { handleApiFormError } = useApiFormError({ logEvent: "menu_control_submit_failed" });
  const {
    data: menuControlListData,
    isPending: isMenuControlListPending,
  } = useMenuControlListQuery(menuId ?? "");
  const { mutate: createMenuControlMutation, isPending: isCreateMenuControlPending } = useCreateMenuControlMutation();
  const { mutate: updateMenuControlMutation, isPending: isUpdateMenuControlPending } = useUpdateMenuControlMutation();
  const { mutate: deleteMenuControlMutation, isPending: isDeleteMenuControlPending } = useDeleteMenuControlMutation();
  const [editingMenuControl, setEditingMenuControl] = useState<MenuControl | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<MenuControlFormSchemaType>({
    resolver: zodResolver(menuControlFormSchema),
    defaultValues: {
      code: "",
      name: "",
    },
  });

  useEffect(() => {
    if (!open) {
      setEditingMenuControl(null);
      setShowForm(false);
      setDeleteTargetId(null);
      reset({
        code: "",
        name: "",
      });
    }
  }, [open, reset]);

  const menuControls = menuControlListData?.data ?? [];
  const isSubmitPending = isCreateMenuControlPending || isUpdateMenuControlPending;

  const openCreateForm = () => {
    setEditingMenuControl(null);
    setDeleteTargetId(null);
    setShowForm(true);
    reset({
      code: "",
      name: "",
    });
  };

  const openEditForm = (menuControl: MenuControl) => {
    setEditingMenuControl(menuControl);
    setDeleteTargetId(null);
    setShowForm(true);
    reset({
      code: menuControl.code,
      name: menuControl.name,
    });
  };

  const closeForm = () => {
    setEditingMenuControl(null);
    setShowForm(false);
    reset({
      code: "",
      name: "",
    });
  };

  const invalidateMenuControls = () => {
    if (!menuId) return;
    void queryClient.invalidateQueries({ queryKey: queryKeys.menuControl.list(menuId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.access.control(menuId) });
  };

  const onSubmit = (values: MenuControlFormSchemaType) => {
    if (!menuId) return;

    const payload = {
      menu_id: menuId,
      code: values.code,
      name: values.name,
    };

    if (editingMenuControl) {
      updateMenuControlMutation(
        { id: editingMenuControl.id, payload },
        {
          onSuccess: (response) => {
            addToast(response.message, "success");
            invalidateMenuControls();
            closeForm();
          },
          onError: (error) => {
            handleApiFormError(error, {
              menu_id: menuId,
              menu_control_id: editingMenuControl.id,
              action: "update",
            });
          },
        },
      );
      return;
    }

    createMenuControlMutation(payload, {
      onSuccess: (response) => {
        addToast(response.message, "success");
        invalidateMenuControls();
        closeForm();
      },
      onError: (error) => {
        handleApiFormError(error, {
          menu_id: menuId,
          action: "create",
          menu_control_code: values.code,
        });
      },
    });
  };

  const onDelete = (menuControlId: string) => {
    deleteMenuControlMutation(menuControlId, {
      onSuccess: (response) => {
        addToast(response.message, "success");
        invalidateMenuControls();
        setDeleteTargetId(null);
      },
      onError: (error) => {
        handleApiFormError(error, {
          menu_id: menuId,
          menu_control_id: menuControlId,
          action: "delete",
        });
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage Menu Controls"
      subtitle={menuName ? `Configure access actions for ${menuName}.` : "Configure access actions for this menu."}
      className="max-w-4xl"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600">Selected Menu</p>
              <p className="mt-1 text-lg font-semibold text-dark-900">{menuName ?? "-"}</p>
            </div>
            <Button type="button" variant="success" icon={Plus} onClick={openCreateForm}>
              Add Control
            </Button>
          </div>

          <div className="space-y-3">
            {isMenuControlListPending ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 rounded-2xl border border-light-200 bg-light-100" />
              ))
            ) : menuControls.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-dark-200 bg-light-50 p-6 text-center">
                <p className="text-sm font-medium text-dark-700">No menu controls yet.</p>
                <p className="mt-1 text-sm text-dark-500">
                  Add actions like create, read, update, or delete for this menu.
                </p>
              </div>
            ) : (
              menuControls.map((menuControl) => (
                <div key={menuControl.id} className="rounded-2xl border border-dark-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-secondary-100 px-2.5 py-1 text-xs font-bold tracking-[0.16em] text-secondary-800">
                          {menuControl.code}
                        </span>
                        <p className="text-base font-semibold text-dark-900">{menuControl.name}</p>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-dark-400">
                        Control ID: {menuControl.id}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="warning-outline"
                        icon={Pencil}
                        className="px-3"
                        onClick={() => openEditForm(menuControl)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger-outline"
                        icon={Trash2}
                        className="px-3"
                        onClick={() =>
                          setDeleteTargetId((prev) => (prev === menuControl.id ? null : menuControl.id))
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {deleteTargetId === menuControl.id ? (
                    <div className="mt-4 rounded-2xl border border-danger-200 bg-danger-50 p-4">
                      <p className="text-sm font-medium text-danger-800">
                        Delete <span className="font-semibold">{menuControl.name}</span> from this menu?
                      </p>
                      <div className="mt-3 flex gap-3">
                        <Button
                          type="button"
                          variant="danger"
                          loading={isDeleteMenuControlPending}
                          onClick={() => onDelete(menuControl.id)}
                        >
                          Confirm Delete
                        </Button>
                        <Button type="button" variant="light-outline" onClick={() => setDeleteTargetId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-primary-100 bg-gradient-to-br from-white via-white to-primary-50/70 p-5 shadow-[0_20px_40px_-30px_rgba(30,41,59,0.28)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Control Form</p>
          <h3 className="mt-2 text-xl font-semibold text-dark-900">
            {editingMenuControl ? "Edit Control" : "Add Control"}
          </h3>
          <p className="mt-1 text-sm leading-6 text-dark-500">
            {showForm
              ? "Update the control details below and save your changes."
              : "Click Add Control to create a new action for this menu."}
          </p>

          {showForm ? (
            <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <FormInput control={control} name="code" label="Code" placeholder="R, C, U, D" />
              <FormInput control={control} name="name" label="Name" placeholder="Read, Create, Update, Delete" />

              <div className="flex flex-wrap gap-3">
                <Button type="button" buttonType="submit" loading={isSubmitPending} onClick={handleSubmit(onSubmit)}>
                  {editingMenuControl ? "Update Control" : "Save Control"}
                </Button>
                <Button type="button" variant="light-outline" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-primary-200 bg-white/80 p-4">
              <p className="text-sm text-dark-500">
                You can manage control codes for this menu from here without opening another modal.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
