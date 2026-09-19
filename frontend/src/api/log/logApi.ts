import type { ApiResponse } from "../../interfaces/api";
import type { LogItem, LogPayload, LogQuery } from "../../interfaces/log";
import api from "../axios";
import { toApiError } from "../apiError";

export const logApi = {
  create: async (payload: LogPayload): Promise<ApiResponse<undefined>> => {
    try {
      const response = await api.post<ApiResponse<undefined>>("/api/log", payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  index: async (query?: LogQuery): Promise<ApiResponse<LogItem[]>> => {
    try {
      const response = await api.get<ApiResponse<LogItem[]>>("/api/log", { params: query });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  clear: async (query?: LogQuery): Promise<ApiResponse<undefined>> => {
    try {
      const response = await api.delete<ApiResponse<undefined>>("/api/log", { params: query });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};

