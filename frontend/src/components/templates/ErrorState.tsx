import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Home } from "lucide-react";
import type { ReactNode } from "react";
import { AppLogo } from "../shared/AppLogo";
import { Button } from "../ui";
import { cn } from "../../utils/cn";

type ErrorTone = "primary" | "warning" | "danger" | "info";

interface ErrorStateProps {
  code: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone?: ErrorTone;
  onReset?: () => void;
  resetLabel?: string;
  showDashboardLink?: boolean;
  dashboardLabel?: string;
  footer?: ReactNode;
}

const toneClassMap: Record<ErrorTone, { badge: string; iconWrap: string; glow: string }> = {
  primary: {
    badge: "bg-primary-100 text-primary-700",
    iconWrap: "bg-primary-600 text-white",
    glow: "from-primary-500/18 via-primary-200/10 to-transparent",
  },
  warning: {
    badge: "bg-warning-100 text-warning-700",
    iconWrap: "bg-warning-500 text-white",
    glow: "from-warning-400/18 via-warning-200/10 to-transparent",
  },
  danger: {
    badge: "bg-danger-100 text-danger-700",
    iconWrap: "bg-danger-500 text-white",
    glow: "from-danger-400/18 via-danger-200/10 to-transparent",
  },
  info: {
    badge: "bg-info-100 text-info-700",
    iconWrap: "bg-info-500 text-white",
    glow: "from-info-400/18 via-info-200/10 to-transparent",
  },
};

export const ErrorState = ({
  code,
  title,
  description,
  icon: Icon,
  tone = "primary",
  onReset,
  resetLabel = "Go Back",
  showDashboardLink = true,
  dashboardLabel = "Go to Dashboard",
  footer,
}: ErrorStateProps) => {
  const toneClass = toneClassMap[tone];

  return (
    <main className="relative min-h-screen overflow-hidden bg-light-100 px-4 py-8 sm:px-6 lg:px-8">
      <div
        className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", toneClass.glow)}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.16),_transparent_60%)]" />

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[32px] border border-primary-100/60 bg-white/88 shadow-[0_30px_80px_-45px_rgba(30,41,59,0.32)] backdrop-blur-xl lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-secondary-400 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="relative mb-10">
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center">
                  <AppLogo variant="icon" className="h-10 w-10" />
                </div>
                <p className="text-sm uppercase tracking-[0.22em] text-white/80">Iotku</p>
              </div>
              <div>
                <h2 className="mt-4 text-4xl font-semibold leading-tight max-w-[350px]">
                  The latest software and hardware are here
                </h2>
                <p className="mt-4 max-w-sm text-sm text-white/85">
                  SEO-friendly public pages can stay on CodeIgniter, while couple and admin
                  experiences live under React.
                </p>
              </div>
            </div>

            <div className="relative rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                System status
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-secondary-300 shadow-[0_0_20px_rgba(16,185,129,0.85)]" />
                <p className="text-sm text-white/85">
                  The app is still active. You can safely return or navigate elsewhere.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-12">
            <div className="mx-auto flex max-w-xl flex-col justify-center">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
                      toneClass.badge,
                    )}
                  >
                    {code}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-light-200 bg-white px-3 py-1 text-xs font-medium text-dark-500">
                    <span className="h-2 w-2 rounded-full bg-secondary-400" />
                    Error 404 Panel
                  </div>
                </div>
                <AppLogo variant="mark" className="lg:hidden block h-7" />
              </div>

              <div
                className={cn(
                  "inline-flex h-16 w-16 items-center justify-center rounded-[22px] shadow-lg shadow-dark-900/8",
                  toneClass.iconWrap,
                )}
              >
                <Icon className="h-8 w-8" />
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-dark-900 sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-lg text-base md:leading-8 text-dark-500 sm:text-lg">
                {description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {onReset ? (
                  <Button type="button" variant="dark" icon={ArrowLeft} onClick={onReset}>
                    {resetLabel}
                  </Button>
                ) : null}
                {showDashboardLink ? (
                  <a
                    href={"/"}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-500 px-4 py-2.5 text-sm font-semibold text-primary-700 transition text-nowrap hover:bg-primary-50"
                  >
                    <Home className="h-4 w-4" />
                    <span>{dashboardLabel}</span>
                  </a>
                ) : null}
              </div>

              {footer ? <div className="mt-8">{footer}</div> : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
