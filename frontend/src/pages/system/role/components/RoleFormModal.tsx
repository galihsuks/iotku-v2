import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button, FormInput, Modal } from "../../../../components/ui";
import { useCreateRoleMutation, useRoleDetailQuery, useUpdateRoleMutation } from "../../../../api/role/roleQuery";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import { queryKeys } from "../../../../api/queryKeys";
import { useNotificationStore } from "../../../../store/notifStore";
import { type RoleFormSchemaType, roleFormSchema } from "../schema/RoleFormSchema";

interface RoleFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  roleId?: string | null;
  onClose: () => void;
}

export const RoleFormModal = ({ open, mode, roleId, onClose }: RoleFormModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { mutate: createRoleMutation, isPending: isCreateRolePending } = useCreateRoleMutation();
  const { mutate: updateRoleMutation, isPending: isUpdateRolePending } = useUpdateRoleMutation();
  const { handleApiFormError } = useApiFormError({ logEvent: "role_form_submit_failed" });
  const { data: roleDetailData, isPending: isRoleDetailPending } = useRoleDetailQuery(mode === "edit" ? (roleId ?? "") : "");

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<RoleFormSchemaType>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      reset({
        code: "",
        name: "",
        description: "",
      });
      return;
    }

    if (!roleDetailData?.data) return;

    reset({
      code: roleDetailData.data.code,
      name: roleDetailData.data.name,
      description: roleDetailData.data.description ?? "",
    });
  }, [mode, open, reset, roleDetailData?.data]);

  const isSubmitPending = isCreateRolePending || isUpdateRolePending;

  const onSubmit = (values: RoleFormSchemaType) => {
    const payload = {
      code: values.code,
      name: values.name,
      description: values.description || null,
    };

    if (mode === "create") {
      createRoleMutation(payload, {
        onSuccess: (response) => {
          addToast(response.message, "success");
          void queryClient.invalidateQueries({ queryKey: ["role"] });
          onClose();
        },
        onError: (error) => {
          handleApiFormError(error, {
            form_mode: mode,
            role_code: values.code,
          });
        },
      });
      return;
    }

    if (!roleId) return;

    updateRoleMutation(
      { id: roleId, payload },
      {
        onSuccess: (response) => {
          addToast(response.message, "success");
          void queryClient.invalidateQueries({ queryKey: ["role"] });
          void queryClient.invalidateQueries({ queryKey: queryKeys.role.detail(roleId) });
          onClose();
        },
        onError: (error) => {
          handleApiFormError(error, {
            form_mode: mode,
            role_id: roleId,
            role_code: values.code,
          });
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Create role" : "Edit role"}
      subtitle={
        mode === "create"
          ? "Create a new role to organize permissions and system access."
          : "Update the selected role information."
      }
      className="max-w-xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="light-outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" buttonType="submit" loading={isSubmitPending} onClick={handleSubmit(onSubmit)}>
            {mode === "create" ? "Save Role" : "Update Role"}
          </Button>
        </div>
      }
    >
      {mode === "edit" && isRoleDetailPending ? (
        <div className="space-y-3">
          <div className="h-11 rounded-xl bg-light-100" />
          <div className="h-11 rounded-xl bg-light-100" />
          <div className="h-20 rounded-xl bg-light-100" />
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FormInput control={control} name="code" label="Role Code" placeholder="SA, ADMIN, USER" />
          <FormInput control={control} name="name" label="Role Name" placeholder="Super Admin" />
          <FormInput
            control={control}
            name="description"
            label="Description"
            placeholder="Short description about this role"
          />
        </form>
      )}
    </Modal>
  );
};
