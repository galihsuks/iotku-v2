import type { ApiResponse } from "../../interfaces/api";
import type { ID, KeywordPaginationQuery } from "../../interfaces/common";
import type { Role, RolePayload } from "../../interfaces/role";
import api from "../axios";
import { toApiError } from "../apiError";

export const roleApi = {
  index: async (query?: KeywordPaginationQuery): Promise<ApiResponse<Role[]>> => {
    try {
      const response = await api.get<ApiResponse<Role[]>>("/api/role", { params: query });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  detail: async (id: ID): Promise<ApiResponse<Role>> => {
    try {
      const response = await api.get<ApiResponse<Role>>(`/api/role/${id}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  create: async (payload: RolePayload): Promise<ApiResponse<Role>> => {
    try {
      const response = await api.post<ApiResponse<Role>>("/api/role", payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  update: async (id: ID, payload: RolePayload): Promise<ApiResponse<Role>> => {
    try {
      const response = await api.put<ApiResponse<Role>>(`/api/role/${id}`, payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  delete: async (id: ID): Promise<ApiResponse<Role>> => {
    try {
      const response = await api.delete<ApiResponse<Role>>(`/api/role/${id}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};

