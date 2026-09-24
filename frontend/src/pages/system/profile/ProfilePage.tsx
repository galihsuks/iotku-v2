import { ShieldCheck, UserRound } from "lucide-react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Badge } from "../../../components/ui";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useUser } from "../../../store/authStore";
import { ProfileInformationCard } from "./components/ProfileInformationCard";
import { ProfilePasswordCard } from "./components/ProfilePasswordCard";

export const ProfilePage = () => {
  usePageTitle("Profile");

  const user = useUser();

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Kelola informasi akun dan password user login."
        breadcrumbs={[
          { label: "System", route: undefined },
          { label: "Profile", route: undefined },
        ]}
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4">
          <ProfileInformationCard user={user} />
          <ProfilePasswordCard />
        </div>

        <aside className="rounded-2xl border border-dark-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <UserRound className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-dark-900">
            {user?.full_name ?? "User"}
          </h2>
          <p className="mt-1 text-sm text-dark-500">@{user?.username ?? "-"}</p>

          <div className="mt-5 space-y-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
                Email
              </p>
              <p className="mt-1 break-all font-medium text-dark-800">{user?.email ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
                Role
              </p>
              <div className="mt-2">
                <Badge variant="primary-outline">
                  {user?.role ? `${user.role.code} - ${user.role.name}` : "No role"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-success-100 bg-success-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-success-600" />
              <div>
                <p className="text-sm font-semibold text-dark-900">Account Security</p>
                <p className="mt-1 text-sm leading-6 text-dark-500">
                  Gunakan password yang kuat dan jangan bagikan akses akun ke orang lain.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
};
