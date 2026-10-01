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
  update: async (id: string, payload: SensorUnitPayload): Promise<ApiResponse<SensorUnit>> => {
    try {
      const response = await api.put<ApiResponse<SensorUnit>>(`/api/sensor/units/${id}`, payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  delete: async (id: string): Promise<ApiResponse<SensorUnit>> => {
    try {
      const response = await api.delete<ApiResponse<SensorUnit>>(`/api/sensor/units/${id}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};

