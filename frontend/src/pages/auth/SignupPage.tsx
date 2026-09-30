import { KeyRound, Mail, UserPlus, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuthSignupMutation } from "../../api/auth/authQuery";
import { AppLogo } from "../../components/shared/AppLogo";
import { Button, FormInput } from "../../components/ui";
import { usePageTitle } from "../../hooks/usePageTitle";
import type { SignupPayload } from "../../interfaces/auth";
import { queryClient } from "../../lib/queryClient";
import { useAuthActions } from "../../store/authStore";
import { useNotificationStore } from "../../store/notifStore";
import envVar from "../../utils/envReader";

export const SignupPage = () => {
  usePageTitle("Create account");

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
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-glow">
              <AppLogo variant="icon" className="h-8 w-auto" />
            </div>
            <div>
              <p className="text-xl font-semibold text-primary-700 leading-5">Iotku</p>
              <p className="text-[10px] text-dark-500">{envVar.APP_VERSION}</p>
            </div>
          </div>
          <hr className="border-dark-200 mb-4" />
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-dark-900">
            Create account
          </h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm leading-5 md:leading-6 text-dark-500">
            Sign up to start connecting your IoT devices.
          </p>
        </div>

        <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit(onSubmit)}>
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

        <p className="mt-4 md:mt-6 text-center text-xs md:text-sm text-dark-500">
          Already have an account?{" "}
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
