import { KeyRound, LogIn, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthLoginMutation } from "../../api/auth/authQuery";
import { AppLogo } from "../../components/shared/AppLogo";
import { Button, FormInput } from "../../components/ui";
import type { LoginPayload } from "../../interfaces/auth";
import { queryClient } from "../../lib/queryClient";
import { useAuthActions } from "../../store/authStore";
import { useNotificationStore } from "../../store/notifStore";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthActions();
  const { addToast } = useNotificationStore();
  const { mutate, isPending } = useAuthLoginMutation();
  const { control, handleSubmit } = useForm<LoginPayload>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (payload: LoginPayload) => {
    mutate(payload, {
      onSuccess: (response) => {
        if (response.data) {
          login(response.data);
        }
        queryClient.invalidateQueries();
        addToast(response.message || "Login successfully.", "success");
        const redirect = searchParams.get("redirect");
        navigate(redirect && redirect.startsWith("/") ? redirect : "/", { replace: true });
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
          <h1 className="text-2xl font-semibold tracking-tight text-dark-900">Sign in</h1>
          <p className="mt-2 text-sm leading-6 text-dark-500">
            Masuk untuk memantau sensor dan realtime device kamu.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            control={control}
            name="username"
            label="Username or Email"
            icon={UserRound}
            placeholder="username"
            rules={{ required: "Username is required." }}
          />
          <FormInput
            control={control}
            name="password"
            label="Password"
            type="password"
            icon={KeyRound}
            placeholder="password"
            rules={{ required: "Password is required." }}
          />
          <Button
            buttonType="submit"
            variant="primary"
            icon={LogIn}
            loading={isPending}
            className="w-full"
          >
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-dark-500">
          Belum punya akun?{" "}
          <Link
            to="/auth/signup"
            className="font-semibold text-primary-700 transition hover:text-primary-600"
          >
            Daftar sekarang
          </Link>
        </p>
      </section>
    </main>
  );
};
