import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type BadgeVariant =
  | "primary"
  | "primary-outline"
  | "secondary"
  | "secondary-outline"
  | "success"
  | "success-outline"
  | "info"
  | "info-outline"
  | "warning"
  | "warning-outline"
  | "danger"
  | "danger-outline"
  | "light"
  | "light-outline"
  | "dark"
  | "dark-outline";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

const variantClass: Record<BadgeVariant, string> = {
  primary: "bg-primary-600 text-white border border-primary-600",
  "primary-outline": "bg-primary-50 text-primary-700 border border-primary-500",
  secondary: "bg-secondary-50 text-secondary-500",
  "secondary-outline": "bg-secondary-50 text-secondary-700 border border-secondary-400",
  success: "bg-success-50 text-success-500 border border-success-200",
  "success-outline": "bg-white text-success-500 border border-success-500",
  info: "bg-info-50 text-info-500 border border-info-200",
  "info-outline": "bg-white text-info-500 border border-info-500",
  warning: "bg-warning-50 text-warning-500 border border-warning-200",
  "warning-outline": "bg-white text-warning-500 border border-warning-500",
  danger: "bg-danger-50 text-danger-500 border border-danger-200",
  "danger-outline": "bg-white text-danger-500 border border-danger-500",
  light: "bg-light-100 text-dark-700 border border-light-200",
  "light-outline": "bg-white text-dark-700 border border-light-300",
  dark: "bg-dark-800 text-white border border-dark-800",
  "dark-outline": "bg-dark-50 text-dark-700 border border-dark-300",
};

export const Badge = ({ variant = "light", className, children }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-[3px] sm:py-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-center text-nowrap",
        variantClass[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};
