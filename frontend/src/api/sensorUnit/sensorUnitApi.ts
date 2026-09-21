import type { ApiResponse } from "../../interfaces/api";
import type { SensorUnit, SensorUnitPayload, SensorUnitQuery } from "../../interfaces/sensor";
import { toApiError } from "../apiError";
import api from "../axios";

export const sensorUnitApi = {
  index: async (query?: SensorUnitQuery): Promise<ApiResponse<SensorUnit[]>> => {
    try {
      const response = await api.get<ApiResponse<SensorUnit[]>>("/api/sensor/units", {
        params: query,
      });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  create: async (payload: SensorUnitPayload): Promise<ApiResponse<SensorUnit>> => {
    try {
      const response = await api.post<ApiResponse<SensorUnit>>("/api/sensor/units", payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};

