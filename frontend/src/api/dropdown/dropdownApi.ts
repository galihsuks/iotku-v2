import type { ApiResponse } from "../../interfaces/api";
import type { DropdownOption } from "../../interfaces/dropdown";
import api from "../axios";
import { toApiError } from "../apiError";

export const dropdownApi = {
  role: async (keywords = ""): Promise<ApiResponse<DropdownOption[]>> => {
    try {
      const response = await api.get<ApiResponse<DropdownOption[]>>("/api/dropdown/role", {
        params: { keywords },
      });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  user: async (keywords = ""): Promise<ApiResponse<DropdownOption[]>> => {
    try {
      const response = await api.get<ApiResponse<DropdownOption[]>>("/api/dropdown/user", {
        params: { keywords },
      });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};

