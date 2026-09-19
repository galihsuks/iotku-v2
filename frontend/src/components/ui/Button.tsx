import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type ButtonType = "button" | "submit" | "link";
export type ButtonVariant =
  | "primary"
  | "primary-outline"
  | "primary-text"
  | "secondary"
  | "secondary-outline"
  | "secondary-text"
  | "success"
  | "success-outline"
  | "success-text"
  | "info"
  | "info-outline"
  | "info-text"
  | "warning"
  | "warning-outline"
  | "warning-text"
  | "danger"
  | "danger-outline"
  | "danger-text"
  | "light"
  | "light-outline"
  | "light-text"
  | "dark"
  | "dark-outline"
  | "dark-text";

interface ButtonProps {
  type?: ButtonType;
  buttonType?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  icon?: LucideIcon | null;
  link?: string | null;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-500",
  "primary-outline": "border border-primary-500 text-primary-700 hover:bg-primary-50",
  "primary-text": "text-primary-700 hover:text-primary-600",
  secondary: "bg-secondary-500 text-secondary-50 hover:bg-secondary-400",
  "secondary-outline": "border border-secondary-400 text-secondary-600 hover:bg-secondary-50",
  "secondary-text": "text-secondary-600 hover:text-secondary-500",
  success: "bg-success-50 text-success-500 hover:bg-success-100",
  "success-outline": "border border-success-500 text-success-500 hover:bg-success-50",
  "success-text": "text-success-600 hover:text-success-500",
  info: "bg-info-50 text-info-500 hover:bg-info-100",
  "info-outline": "border border-info-500 text-info-500 hover:bg-info-50",
  "info-text": "text-info-600 hover:text-info-500",
  warning: "bg-warning-50 text-warning-500 hover:bg-warning-100",
  "warning-outline": "border border-warning-500 text-warning-500 hover:bg-warning-50",
  "warning-text": "text-warning-600 hover:text-warning-500",
  danger: "bg-danger-50 text-danger-500 hover:bg-danger-100",
  "danger-outline": "border border-danger-500 text-danger-500 hover:bg-danger-50",
  "danger-text": "text-danger-600 hover:text-danger-500",
  light: "bg-light-100 text-dark-800 hover:bg-light-200",
  "light-outline": "border border-light-300 text-dark-700 hover:bg-light-50",
  "light-text": "text-dark-500 hover:text-dark-700",
  dark: "bg-dark-800 text-white hover:bg-dark-700",
  "dark-outline": "border border-dark-500 text-dark-700 hover:bg-dark-50",
  "dark-text": "text-dark-700 hover:text-dark-900",
};

export const Button = ({
  type = "button",
  buttonType = "button",
  variant = "primary",
  icon: Icon = null,
  link = null,
  className,
  children,
  disabled = false,
  loading = false,
  onClick,
}: ButtonProps) => {
  const hasContent = Boolean(loading || Icon || children);

  if (!hasContent) {
    return null;
  }

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
      ) : null}
      {children ? <span>{children}</span> : null}
    </>
  );

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition text-nowrap",
    !children ? "px-3" : "",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variantClass[variant],
    className,
  );

  if (type === "link" && link) {
    return (
      <Link to={link} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={buttonType} disabled={disabled || loading} className={classes} onClick={onClick}>
      {content}
    </button>
  );
};
