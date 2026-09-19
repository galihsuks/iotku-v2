import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button, FormInput, Modal } from "../../../../components/ui";
import { useCreateUserMutation, useUpdateUserMutation, useUserDetailQuery } from "../../../../api/user/userQuery";
import { dropdownApi } from "../../../../api/dropdown/dropdownApi";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import { useNotificationStore } from "../../../../store/notifStore";
import { queryKeys } from "../../../../api/queryKeys";
import { createUserFormSchema, type UserFormSchemaType } from "../schema/UserFormSchema";

interface UserFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  userId?: string | null;
  onClose: () => void;
}

export const UserFormModal = ({ open, mode, userId, onClose }: UserFormModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { mutate: createUserMutation, isPending: isCreateUserPending } = useCreateUserMutation();
  const { mutate: updateUserMutation, isPending: isUpdateUserPending } = useUpdateUserMutation();
  const { handleApiFormError } = useApiFormError({ logEvent: "user_form_submit_failed" });
  const { data: userDetailData, isPending: isUserDetailPending } = useUserDetailQuery(
    mode === "edit" ? (userId ?? "") : "",
  );

  const formSchema = useMemo(() => createUserFormSchema(mode === "create"), [mode]);

  const { control, handleSubmit, reset } = useForm<UserFormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
      role_id: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      reset({
        username: "",
        full_name: "",
        email: "",
        password: "",
        role_id: "",
      });
      return;
    }

    if (!userDetailData?.data) return;

    reset({
      username: userDetailData.data.username,
      full_name: userDetailData.data.full_name,
      email: userDetailData.data.email,
      password: "",
      role_id: userDetailData.data.role?.id ?? "",
    });
  }, [mode, open, reset, userDetailData?.data]);

  const roleOptions = useMemo(() => {
    if (!userDetailData?.data?.role) {
      return [];
    }

    return [
      {
        value: userDetailData.data.role.id,
        label: `${userDetailData.data.role.code} - ${userDetailData.data.role.name}`,
      },
    ];
  }, [userDetailData?.data?.role]);

  const isSubmitPending = isCreateUserPending || isUpdateUserPending;

  const onSubmit = (values: UserFormSchemaType) => {
    if (mode === "create") {
      createUserMutation(
        {
          username: values.username,
          full_name: values.full_name,
          email: values.email,
          password: values.password as string,
          role_id: values.role_id,
        },
        {
          onSuccess: (response) => {
            addToast(response.message, "success");
            void queryClient.invalidateQueries({ queryKey: ["user"] });
            onClose();
          },
          onError: (error) => {
            handleApiFormError(error, {
              form_mode: mode,
              username: values.username,
              email: values.email,
            });
          },
        },
      );
      return;
    }

    if (!userId) return;

    updateUserMutation(
      {
        id: userId,
        payload: {
          username: values.username,
          full_name: values.full_name,
          email: values.email,
          password: values.password || undefined,
          role_id: values.role_id,
        },
      },
      {
        onSuccess: (response) => {
          addToast(response.message, "success");
          void queryClient.invalidateQueries({ queryKey: ["user"] });
          void queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
          onClose();
        },
        onError: (error) => {
          handleApiFormError(error, {
            form_mode: mode,
            user_id: userId,
            username: values.username,
            email: values.email,
          });
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Create user" : "Edit user"}
      subtitle={
        mode === "create"
          ? "Create a new user account and assign a role."
          : "Update account information for the selected user."
      }
      className="max-w-2xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="light-outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" buttonType="submit" loading={isSubmitPending} onClick={handleSubmit(onSubmit)}>
            {mode === "create" ? "Save User" : "Update User"}
          </Button>
        </div>
      }
    >
      {mode === "edit" && isUserDetailPending ? (
        <div className="space-y-3">
          <div className="h-11 rounded-xl bg-light-100" />
          <div className="h-11 rounded-xl bg-light-100" />
          <div className="h-11 rounded-xl bg-light-100" />
          <div className="h-11 rounded-xl bg-light-100" />
        </div>
      ) : (
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <FormInput control={control} name="username" label="Username" placeholder="john.doe" />
          <FormInput control={control} name="full_name" label="Full Name" placeholder="John Doe" />
          <FormInput
            control={control}
            name="email"
            type="email"
            label="Email"
            placeholder="john@example.com"
          />
          <FormInput
            control={control}
            name="role_id"
            type="dropdown"
            label="Role"
            placeholder="Select role"
            dropdownOptions={roleOptions}
            loadDropdownOptions={async (keywords) => {
              const response = await dropdownApi.role(keywords);
              return response.data ?? [];
            }}
          />
          <FormInput
            control={control}
            name="password"
            type="password"
            label={mode === "create" ? "Password" : "New Password"}
            placeholder={mode === "create" ? "Enter password" : "Leave blank to keep current password"}
            className="md:col-span-2"
          />
        </form>
      )}
    </Modal>
  );
};
