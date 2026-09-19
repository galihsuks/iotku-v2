import axios from "axios";

type ErrorData = {
  message?: string;
  data?: {
    message?: string;
  };
};

export interface ApiRequestError extends Error {
  statusCode: number | null;
  hasResponse: boolean;
}

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ErrorData>(error)) {
    return (
      error.response?.data?.message ??
      error.response?.data?.data?.message ??
      error.message ??
      "Request failed"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Request failed";
};

export const toApiError = (error: unknown): ApiRequestError => {
  const normalized = new Error(getApiErrorMessage(error)) as ApiRequestError;

  if (axios.isAxiosError(error)) {
    const statusCode = Number(error.response?.status ?? 0);
    normalized.statusCode = Number.isFinite(statusCode) && statusCode > 0 ? statusCode : null;
    normalized.hasResponse = Boolean(error.response);

    return normalized;
  }

  normalized.statusCode = null;
  normalized.hasResponse = false;

  return normalized;
};
