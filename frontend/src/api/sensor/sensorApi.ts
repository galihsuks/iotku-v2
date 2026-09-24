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

const getFilenameFromDisposition = (disposition?: string) => {
  if (!disposition) return null;

  const match = disposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? null;
};

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
  exportReadings: async (id: ID): Promise<{ blob: Blob; filename: string }> => {
    try {
      const response = await api.get<Blob>(`/api/sensor/${id}/readings/export`, {
        responseType: "blob",
      });
      const filename =
        getFilenameFromDisposition(response.headers["content-disposition"]) ??
        `sensor-${id}-readings.xlsx`;

      return {
        blob: response.data,
        filename,
      };
    } catch (error) {
      throw toApiError(error);
    }
  },
  resetReadings: async (id: ID): Promise<ApiResponse<{ deleted_count: number }>> => {
    try {
      const response = await api.delete<ApiResponse<{ deleted_count: number }>>(
        `/api/sensor/${id}/readings`,
      );
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
