import { ArrowLeft, ChevronRight, PanelRight } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useCollapseDesktopSidebar, useLayoutActions } from "../../store/layoutStore";
import { Badge, type BadgeVariant } from "../ui";

interface PageHeaderBreadcrumb {
  label: string;
  route: string | undefined;
}

interface PageHeaderProps {
  showGoBack?: boolean;
  title: string;
  subtitle?: string;
  breadcrumbs?: PageHeaderBreadcrumb[];
  rightElement?: ReactNode;
  className?: string;
  badges?: {
    variant: BadgeVariant;
    text: string;
  }[];
}

export const PageHeader = ({
  showGoBack = false,
  title,
  subtitle,
  breadcrumbs = [],
  rightElement,
  className,
  badges = [],
}: PageHeaderProps) => {
  const collapseDesktopSidebar = useCollapseDesktopSidebar();
  const { setCollapseDesktopSidebar } = useLayoutActions();
  const navigate = useNavigate();

  return (
    <header className={cn("mb-6 cursor-default", className)}>
      <div
        className={cn(
          "flex items-center mb-4 transition-all duration-300",
          collapseDesktopSidebar ? "gap-3" : "gap-0",
        )}
      >
        <div
          onClick={() => setCollapseDesktopSidebar(false)}
          className={cn(
            "transition-all duration-300 overflow-hidden hidden text-dark-500 hover:bg-dark-100 hover:text-dark-700 md:inline-flex",
            collapseDesktopSidebar ? "w-4" : "w-0",
          )}
        >
          <PanelRight className="h-4 w-4" />
        </div>
        {breadcrumbs.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
            {breadcrumbs.map((breadcrumb, index) => {
              const isLastItem = index === breadcrumbs.length - 1;

              return (
                <div key={`${breadcrumb.label}-${index}`} className="flex items-center gap-2">
                  {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-dark-300" /> : null}
                  {breadcrumb.route && !isLastItem ? (
                    <span
                      onClick={() => navigate(breadcrumb.route as string)}
                      className="cursor-pointer transition hover:text-primary-600"
                    >
                      {breadcrumb.label}
                    </span>
                  ) : (
                    <span className={cn(isLastItem ? "text-dark-500" : "")}>
                      {breadcrumb.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start lg:justify-between">
        <div className="flex items-start gap-3 flex-1">
          {showGoBack ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cursor-pointer inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary-100 bg-white text-dark-700 shadow-sm transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : null}

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-dark-900 sm:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 max-w-2xl text-xs leading-5 sm:leading-6 text-dark-500 sm:text-sm">
                {subtitle}
              </p>
            ) : null}
            <div className="flex items-center gap-2">
              {badges.map((badge, ind_badge) => (
                <Badge key={ind_badge} className="mt-2" variant={badge.variant}>
                  {badge.text}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {rightElement}
      </div>
    </header>
  );
};
