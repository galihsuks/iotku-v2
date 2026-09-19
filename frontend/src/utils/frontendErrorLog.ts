import { logApi } from "../api/log/logApi";

export const sendFrontendErrorLog = async (
  message: string,
  context?: Record<string, unknown>,
): Promise<void> => {
  try {
    await logApi.create({
      level: "error",
      message,
      context: context ?? {},
    });
  } catch {
    // swallow to avoid error loop
  }
};
