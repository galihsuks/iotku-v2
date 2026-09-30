import { CircleAlert, CircleCheckBig, Info, X } from "lucide-react";
import { useNotificationStore } from "../../store/notifStore";
import { cn } from "../../utils/cn";

export const ToastContainer = () => {
  const toasts = useNotificationStore((state) => state.toasts);
  const removeToast = useNotificationStore((state) => state.removeToast);

  const getToastStyle = (type: "success" | "error" | "info") => {
    if (type === "success") {
      return {
        container:
          "border-success-200 bg-gradient-to-br from-white via-white to-success-50/90 text-success-800",
        iconWrapper: "bg-success-100 text-success-700",
        closeButton: "text-success-700/70 hover:bg-success-100 hover:text-success-800",
        Icon: CircleCheckBig,
      };
    }

    if (type === "error") {
      return {
        container:
          "border-danger-200 bg-gradient-to-br from-white via-white to-danger-50/90 text-danger-800",
        iconWrapper: "bg-danger-100 text-danger-700",
        closeButton: "text-danger-700/70 hover:bg-danger-100 hover:text-danger-800",
        Icon: CircleAlert,
      };
    }

    return {
      container:
        "border-info-200 bg-gradient-to-br from-white via-white to-info-50/90 text-info-800",
      iconWrapper: "bg-info-100 text-info-700",
      closeButton: "text-info-700/70 hover:bg-info-100 hover:text-info-800",
      Icon: Info,
    };
  };

  return (
    <div className="fixed top-4 right-4 z-[1000] grid w-[calc(100vw-(var(--spacing)*12))] md:w-[min(340px,calc(100vw-2rem))] gap-2">
      {toasts.map((toast) => {
        const { container, iconWrapper, closeButton, Icon } = getToastStyle(toast.type);

        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-2xl border p-3 shadow-[0_16px_30px_-20px_rgba(15,23,42,0.45)] backdrop-blur-sm",
              container,
            )}
          >
            <div className="flex min-w-0 items-center gap-2 md:gap-3">
              <div
                className={cn(
                  "inline-flex h-7 w-7 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-xl",
                  iconWrapper,
                )}
              >
                <Icon className="h-3 w-3 md:h-4 md:w-4" />
              </div>
              <p className="text-xs md:text-sm font-medium leading-4 md:leading-5">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              className={cn(
                "inline-flex h-8 w-8 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-lg transition",
                closeButton,
              )}
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              <X className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
