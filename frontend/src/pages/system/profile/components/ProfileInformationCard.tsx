import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Mail, Save, UserRound } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateProfileMutation } from "../../../../api/auth/authQuery";
import { queryKeys } from "../../../../api/queryKeys";
import { Button, FormInput } from "../../../../components/ui";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import type { User } from "../../../../interfaces/auth";
import { useAuthActions } from "../../../../store/authStore";
import { useNotificationStore } from "../../../../store/notifStore";
import { profileSchema, type ProfileSchemaType } from "../schema/ProfileSchema";

interface ProfileInformationCardProps {
  user: User | null;
}

export const ProfileInformationCard = ({ user }: ProfileInformationCardProps) => {
  const queryClient = useQueryClient();
  const { syncUser } = useAuthActions();
  const { addToast } = useNotificationStore();
  const { mutate: updateProfileMutation, isPending } = useUpdateProfileMutation();
  const { handleApiFormError } = useApiFormError({ logEvent: "profile_update_failed" });
  const { control, handleSubmit, reset } = useForm<ProfileSchemaType>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
    },
  });

  useEffect(() => {
    reset({
      username: user?.username ?? "",
      full_name: user?.full_name ?? "",
      email: user?.email ?? "",
    });
  }, [reset, user]);

  const onSubmit = (values: ProfileSchemaType) => {
    updateProfileMutation(values, {
      onSuccess: (response) => {
        syncUser(response.data ?? null);
        queryClient.setQueryData(queryKeys.auth.me, response);
        addToast(response.message, "success");
      },
      onError: (error) => {
        handleApiFormError(error, {
          form_mode: "profile_information",
          username: values.username,
          email: values.email,
        });
      },
    });
  };

  return (
    <section className="rounded-2xl border border-dark-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
          Account
        </p>
        <h2 className="mt-2 text-lg font-semibold text-dark-900">Informasi Profile</h2>
        <p className="mt-1 text-sm text-dark-500">
          Ubah username, nama lengkap, dan email yang dipakai untuk akun ini.
        </p>
      </div>

      <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          control={control}
          name="username"
          label="Username"
          icon={UserRound}
          placeholder="username"
        />
        <FormInput
          control={control}
          name="full_name"
          label="Full Name"
          icon={UserRound}
          placeholder="Nama lengkap"
        />
        <FormInput
          control={control}
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          placeholder="email@example.com"
          className="md:col-span-2"
        />
        <div className="flex justify-end md:col-span-2">
          <Button type="button" buttonType="submit" icon={Save} loading={isPending}>
            Save Profile
          </Button>
        </div>
      </form>
    </section>
  );
};
