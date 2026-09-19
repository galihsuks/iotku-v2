import type { ApiResponse } from "../../interfaces/api";
import type { ID } from "../../interfaces/common";
import type { Parameter, ParameterPayload, ParameterQuery } from "../../interfaces/parameter";
import api from "../axios";
import { toApiError } from "../apiError";

export const parameterApi = {
  index: async (query?: ParameterQuery): Promise<ApiResponse<Parameter[]>> => {
    try {
      const response = await api.get<ApiResponse<Parameter[]>>("/api/parameter", { params: query });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  detail: async (id: ID): Promise<ApiResponse<Parameter>> => {
    try {
      const response = await api.get<ApiResponse<Parameter>>(`/api/parameter/${id}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  create: async (payload: ParameterPayload): Promise<ApiResponse<Parameter>> => {
    try {
      const response = await api.post<ApiResponse<Parameter>>("/api/parameter", payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  update: async (id: ID, payload: ParameterPayload): Promise<ApiResponse<Parameter>> => {
    try {
      const response = await api.put<ApiResponse<Parameter>>(`/api/parameter/${id}`, payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  delete: async (id: ID): Promise<ApiResponse<Parameter>> => {
    try {
      const response = await api.delete<ApiResponse<Parameter>>(`/api/parameter/${id}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};

