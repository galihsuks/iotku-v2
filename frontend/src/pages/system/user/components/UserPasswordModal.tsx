import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useChangeUserPasswordMutation } from "../../../../api/user/userQuery";
import { queryKeys } from "../../../../api/queryKeys";
import { Button, FormInput, Modal } from "../../../../components/ui";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import { useNotificationStore } from "../../../../store/notifStore";
import { userPasswordSchema, type UserPasswordSchemaType } from "../schema/UserPasswordSchema";

interface UserPasswordTarget {
  id: string;
  username: string;
  full_name: string;
}

interface UserPasswordModalProps {
  open: boolean;
  target: UserPasswordTarget | null;
  onClose: () => void;
}

export const UserPasswordModal = ({ open, target, onClose }: UserPasswordModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { mutate: changeUserPasswordMutation, isPending } = useChangeUserPasswordMutation();
  const { handleApiFormError } = useApiFormError({ logEvent: "admin_change_user_password_failed" });
  const { control, handleSubmit, reset } = useForm<UserPasswordSchemaType>({
    resolver: zodResolver(userPasswordSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        new_password: "",
        confirm_password: "",
      });
    }
  }, [open, reset]);

  const handleClose = () => {
    reset({
      new_password: "",
      confirm_password: "",
    });
    onClose();
  };

  const onSubmit = (values: UserPasswordSchemaType) => {
    if (!target) return;

    changeUserPasswordMutation(
      {
        id: target.id,
        payload: values,
      },
      {
        onSuccess: (response) => {
          addToast(response.message, "success");
          void queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(target.id) });
          handleClose();
        },
        onError: (error) => {
          handleApiFormError(error, {
            form_mode: "change_user_password",
            user_id: target.id,
            username: target.username,
          });
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Change User Password"
      subtitle={
        target ? `Set a new password for ${target.full_name} (@${target.username}).` : "Set a new password."
      }
      className="max-w-xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="light-outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" loading={isPending} onClick={handleSubmit(onSubmit)}>
            Save Password
          </Button>
        </div>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          control={control}
          name="new_password"
          type="password"
          label="New Password"
          placeholder="Enter new password"
        />
        <FormInput
          control={control}
          name="confirm_password"
          type="password"
          label="Confirm New Password"
          placeholder="Repeat new password"
        />
      </form>
    </Modal>
  );
};
