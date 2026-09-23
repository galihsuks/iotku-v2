import type { ApiResponse } from "../../interfaces/api";
import type { ID } from "../../interfaces/common";
import type {
  Sensor,
  SensorJoinPayload,
  SensorPayload,
  SensorQuery,
  SensorReading,
  SensorReadingQuery,
} from "../../interfaces/sensor";
import { toApiError } from "../apiError";
import api from "../axios";

export const sensorApi = {
  index: async (query?: SensorQuery): Promise<ApiResponse<Sensor[]>> => {
    try {
      const response = await api.get<ApiResponse<Sensor[]>>("/api/sensor", { params: query });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  detail: async (id: ID): Promise<ApiResponse<Sensor>> => {
    try {
      const response = await api.get<ApiResponse<Sensor>>(`/api/sensor/${id}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  create: async (payload: SensorPayload): Promise<ApiResponse<Sensor>> => {
    try {
      const response = await api.post<ApiResponse<Sensor>>("/api/sensor", payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  join: async (payload: SensorJoinPayload): Promise<ApiResponse<Sensor>> => {
    try {
      const response = await api.post<ApiResponse<Sensor>>("/api/sensor/join", payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  update: async (id: ID, payload: SensorPayload): Promise<ApiResponse<Sensor>> => {
    try {
      const response = await api.put<ApiResponse<Sensor>>(`/api/sensor/${id}`, payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  delete: async (id: ID): Promise<ApiResponse<Sensor>> => {
    try {
      const response = await api.delete<ApiResponse<Sensor>>(`/api/sensor/${id}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  readings: async (
    id: ID,
    query?: SensorReadingQuery,
  ): Promise<ApiResponse<SensorReading[]>> => {
    try {
      const response = await api.get<ApiResponse<SensorReading[]>>(`/api/sensor/${id}/readings`, {
        params: query,
      });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  createReading: async (
    id: ID,
    payload: { value: string | number | boolean; recorded_at_ms?: number },
  ): Promise<ApiResponse<SensorReading>> => {
    try {
      const response = await api.post<ApiResponse<SensorReading>>(
        `/api/sensor/${id}/readings`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};
