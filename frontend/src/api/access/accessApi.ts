import type { ApiResponse } from "../../interfaces/api";
import type { ID } from "../../interfaces/common";
import type { MenuTreeGroup } from "../../interfaces/menu";
import api from "../axios";
import { toApiError } from "../apiError";

export const accessApi = {
  getMenu: async (): Promise<ApiResponse<MenuTreeGroup[]>> => {
    try {
      const response = await api.get<ApiResponse<MenuTreeGroup[]>>("/api/access/menu");
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  getControlCodes: async (menuId: ID): Promise<ApiResponse<string[]>> => {
    try {
      const response = await api.get<ApiResponse<string[]>>(`/api/access/control/${menuId}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};

