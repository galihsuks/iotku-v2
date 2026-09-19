import type { ApiResponse } from "../../interfaces/api";
import type { ID } from "../../interfaces/common";
import type { MenuControl, MenuControlPayload } from "../../interfaces/menuControl";
import api from "../axios";
import { toApiError } from "../apiError";

export const menuControlApi = {
  indexByMenuId: async (menuId: ID): Promise<ApiResponse<MenuControl[]>> => {
    try {
      const response = await api.get<ApiResponse<MenuControl[]>>(`/api/menu-control/${menuId}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  create: async (payload: MenuControlPayload): Promise<ApiResponse<MenuControl>> => {
    try {
      const response = await api.post<ApiResponse<MenuControl>>("/api/menu-control", payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  update: async (id: ID, payload: MenuControlPayload): Promise<ApiResponse<MenuControl>> => {
    try {
      const response = await api.put<ApiResponse<MenuControl>>(`/api/menu-control/${id}`, payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  delete: async (id: ID): Promise<ApiResponse<MenuControl>> => {
    try {
      const response = await api.delete<ApiResponse<MenuControl>>(`/api/menu-control/${id}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};

