import { X } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface ModalProps {
  title: string;
  subtitle?: string | null;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  footer?: ReactNode;
}

export const Modal = ({
  title,
  subtitle = null,
  open,
  onClose,
  children,
  className,
  closeOnBackdrop = true,
  closeOnEsc = true,
  footer = null,
}: ModalProps) => {
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-dark-900/55 p-4 backdrop-blur-[2px]"
      onClick={() => {
        if (closeOnBackdrop) onClose();
      }}
    >
      <div
        className={cn(
          "flex max-h-[calc(100svh-2rem)] w-full max-w-2xl flex-col rounded-2xl border border-primary-100 bg-white shadow-2xl",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-dark-100 px-5 py-4">
          <div>
            <h3 className="text-md sm:text-lg font-semibold text-dark-900">{title}</h3>
            {subtitle ? (
              <p className="sm:mt-1 text-xs sm:text-sm text-dark-500">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-dark-500 transition hover:bg-dark-100 hover:text-dark-700"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-4">{children}</div>

        {footer ? <footer className="border-t border-dark-100 px-5 py-4">{footer}</footer> : null}
      </div>
    </div>
  );
};
