import type { ApiResponse } from "../../interfaces/api";
import type { LogItem, LogQuery } from "../../interfaces/log";
import { toApiError } from "../apiError";
import api from "../axios";

export const websocketLogApi = {
  index: async (query?: LogQuery): Promise<ApiResponse<LogItem[]>> => {
    try {
      const response = await api.get<ApiResponse<LogItem[]>>("/api/websocket-log", {
        params: query,
      });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  clear: async (query?: LogQuery): Promise<ApiResponse<undefined>> => {
    try {
      const response = await api.delete<ApiResponse<undefined>>("/api/websocket-log", {
        params: query,
      });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};
