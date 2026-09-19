import type { ApiRequestError } from "../api/apiError";
import { useNotificationStore } from "../store/notifStore";
import { sendFrontendErrorLog } from "../utils/frontendErrorLog";

type ErrorContext = Record<string, unknown>;

interface UseApiFormErrorOptions {
  defaultMessage?: string;
  logEvent?: string;
}

export const useApiFormError = (options?: UseApiFormErrorOptions) => {
  const { addToast } = useNotificationStore();
  const defaultMessage = options?.defaultMessage ?? "Request failed";
  const logEvent = options?.logEvent ?? "form_submit_failed";

  const handleApiFormError = (error: unknown, context?: ErrorContext) => {
    const message = error instanceof Error ? error.message : defaultMessage;
    const apiError = error as Partial<ApiRequestError> | null;

    const shouldLog =
      !apiError ||
      apiError.hasResponse !== true;

    if (shouldLog) {
      void sendFrontendErrorLog(logEvent, {
        ...(context ?? {}),
        error_message: message,
        status_code: apiError?.statusCode ?? null,
      });
    }

    addToast(message, "error");
  };

  return { handleApiFormError };
};
