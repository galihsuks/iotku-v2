import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useChangeOwnPasswordMutation } from "../../../../api/auth/authQuery";
import { Button, FormInput } from "../../../../components/ui";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import { useNotificationStore } from "../../../../store/notifStore";
import {
  profilePasswordSchema,
  type ProfilePasswordSchemaType,
} from "../schema/ProfileSchema";

export const ProfilePasswordCard = () => {
  const { addToast } = useNotificationStore();
  const { mutate: changePasswordMutation, isPending } = useChangeOwnPasswordMutation();
  const { handleApiFormError } = useApiFormError({ logEvent: "profile_password_update_failed" });
  const { control, handleSubmit, reset } = useForm<ProfilePasswordSchemaType>({
    resolver: zodResolver(profilePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (values: ProfilePasswordSchemaType) => {
    changePasswordMutation(values, {
      onSuccess: (response) => {
        addToast(response.message, "success");
        reset({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      },
      onError: (error) => {
        handleApiFormError(error, {
          form_mode: "profile_password",
        });
      },
    });
  };

  return (
    <section className="rounded-2xl border border-dark-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
          Security
        </p>
        <h2 className="mt-2 text-lg font-semibold text-dark-900">Ganti Password</h2>
        <p className="mt-1 text-sm text-dark-500">
          Masukkan password saat ini sebelum mengganti ke password baru.
        </p>
      </div>

      <form className="mt-5 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          control={control}
          name="current_password"
          type="password"
          label="Current Password"
          icon={KeyRound}
          placeholder="Password saat ini"
        />
        <FormInput
          control={control}
          name="new_password"
          type="password"
          label="New Password"
          icon={KeyRound}
          placeholder="Password baru"
        />
        <FormInput
          control={control}
          name="confirm_password"
          type="password"
          label="Confirm New Password"
          icon={KeyRound}
          placeholder="Ulangi password baru"
        />
        <div className="flex justify-end">
          <Button type="button" buttonType="submit" icon={Save} loading={isPending}>
            Save Password
          </Button>
        </div>
      </form>
    </section>
  );
};
