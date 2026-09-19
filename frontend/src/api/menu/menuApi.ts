import type { ApiResponse } from "../../interfaces/api";
import type { ID } from "../../interfaces/common";
import type { Menu, MenuPayload, MenuTreeGroup } from "../../interfaces/menu";
import api from "../axios";
import { toApiError } from "../apiError";

export const menuApi = {
  index: async (): Promise<ApiResponse<MenuTreeGroup[]>> => {
    try {
      const response = await api.get<ApiResponse<MenuTreeGroup[]>>("/api/menu");
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  detail: async (id: ID): Promise<ApiResponse<Menu>> => {
    try {
      const response = await api.get<ApiResponse<Menu>>(`/api/menu/${id}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  create: async (payload: MenuPayload): Promise<ApiResponse<Menu>> => {
    try {
      const response = await api.post<ApiResponse<Menu>>("/api/menu", payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  update: async (id: ID, payload: MenuPayload): Promise<ApiResponse<Menu>> => {
    try {
      const response = await api.put<ApiResponse<Menu>>(`/api/menu/${id}`, payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  delete: async (id: ID, forceDelete?: boolean): Promise<ApiResponse<Menu | { deleted_menu_ids: ID[] }>> => {
    try {
      const response = await api.delete<ApiResponse<Menu | { deleted_menu_ids: ID[] }>>(`/api/menu/${id}`, {
        params: forceDelete ? { force_delete: 1 } : undefined,
      });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};

