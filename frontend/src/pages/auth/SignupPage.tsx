import { KeyRound, Mail, UserPlus, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuthSignupMutation } from "../../api/auth/authQuery";
import { AppLogo } from "../../components/shared/AppLogo";
import { Button, FormInput } from "../../components/ui";
import type { SignupPayload } from "../../interfaces/auth";
import { queryClient } from "../../lib/queryClient";
import { useAuthActions } from "../../store/authStore";
import { useNotificationStore } from "../../store/notifStore";

export const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthActions();
  const { addToast } = useNotificationStore();
  const { mutate, isPending } = useAuthSignupMutation();
  const { control, handleSubmit, watch } = useForm<SignupPayload>({
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });
  const password = watch("password");

  const onSubmit = (payload: SignupPayload) => {
    mutate(payload, {
      onSuccess: (response) => {
        if (response.data) {
          login(response.data);
        }
        queryClient.invalidateQueries();
        addToast(response.message || "Signup successfully.", "success");
        navigate("/", { replace: true });
      },
      onError: (error) => {
        addToast(error.message, "error");
      },
    });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-light-100 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-primary-100 bg-white p-6 shadow-[0_20px_50px_-35px_rgba(30,41,59,0.32)] sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
            <AppLogo variant="icon" className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-dark-900">Create account</h1>
          <p className="mt-2 text-sm leading-6 text-dark-500">
            Daftar sebagai user untuk mulai menghubungkan device IoT kamu.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            control={control}
            name="full_name"
            label="Full Name"
            icon={UserRound}
            placeholder="Full name"
            rules={{ required: "Full name is required." }}
          />
          <FormInput
            control={control}
            name="username"
            label="Username"
            icon={UserRound}
            placeholder="username"
            rules={{ required: "Username is required." }}
          />
          <FormInput
            control={control}
            name="email"
            label="Email"
            type="email"
            icon={Mail}
            placeholder="Email"
            rules={{ required: "Email is required." }}
          />
          <FormInput
            control={control}
            name="password"
            label="Password"
            type="password"
            icon={KeyRound}
            placeholder="password"
            rules={{ required: "Password is required.", minLength: 6 }}
          />
          <FormInput
            control={control}
            name="confirm_password"
            label="Confirm Password"
            type="password"
            icon={KeyRound}
            placeholder="password"
            rules={{
              required: "Password confirmation is required.",
              validate: (value) => value === password || "Password confirmation does not match.",
            }}
          />
          <Button
            buttonType="submit"
            variant="primary"
            icon={UserPlus}
            loading={isPending}
            className="w-full"
          >
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-dark-500">
          Sudah punya akun?{" "}
          <Link
            to="/auth/login"
            className="font-semibold text-primary-700 transition hover:text-primary-600"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
};
