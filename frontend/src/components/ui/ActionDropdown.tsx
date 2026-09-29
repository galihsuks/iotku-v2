import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";

export interface ActionDropdownItem {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
}

interface ActionDropdownProps {
  icon: LucideIcon;
  label?: string;
  ariaLabel?: string;
  items: ActionDropdownItem[];
  align?: "left" | "right";
  className?: string;
  wrapperClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
}

export const ActionDropdown = ({
  icon: TriggerIcon,
  label,
  ariaLabel = label ?? "Open actions",
  items,
  align = "right",
  className,
  menuClassName,
  wrapperClassName = "inline-flex",
  disabled = false,
}: ActionDropdownProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!items.length) {
    return null;
  }

  return (
    <div ref={dropdownRef} className={`relative ${wrapperClassName}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl border border-light-300 px-3 py-2.5 text-xs font-semibold text-dark-700 transition text-nowrap hover:bg-light-50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm",
          label ? "min-w-0" : "aspect-square",
          open ? "bg-light-50" : "bg-white",
          className,
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <TriggerIcon className="h-3 w-3 sm:h-4 sm:w-4" />
        {label ? <span>{label}</span> : null}
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute top-full z-50 mt-2 min-w-48 rounded-xl border border-dark-200 bg-white p-1.5 shadow-lg",
            align === "right" ? "right-0" : "left-0",
            menuClassName,
          )}
        >
          {items.map((item) => {
            const Icon = item.loading ? Loader2 : item.icon;
            const itemDisabled = Boolean(item.disabled || item.loading);

            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                disabled={itemDisabled}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
                  item.danger
                    ? "text-danger-600 hover:bg-danger-50"
                    : "text-dark-700 hover:bg-light-50",
                )}
                onClick={() => {
                  if (itemDisabled) return;
                  item.onClick();
                  setOpen(false);
                }}
              >
                <Icon className={cn("h-4 w-4", item.loading ? "animate-spin" : "")} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
