import type { ApiResponse } from "../../interfaces/api";
import type { ID } from "../../interfaces/common";
import type {
  RoleMenuControlItem,
  RoleMenuControlMutationResult,
  RoleMenuControlPayload,
} from "../../interfaces/roleMenuControl";
import api from "../axios";
import { toApiError } from "../apiError";

export const roleMenuControlApi = {
  indexByRoleId: async (roleId: ID): Promise<ApiResponse<RoleMenuControlItem[]>> => {
    try {
      const response = await api.get<ApiResponse<RoleMenuControlItem[]>>(`/api/role-menu-control/${roleId}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  updateByChanges: async (
    payload: RoleMenuControlPayload,
  ): Promise<ApiResponse<RoleMenuControlMutationResult>> => {
    try {
      const response = await api.post<ApiResponse<RoleMenuControlMutationResult>>(
        "/api/role-menu-control",
        payload,
      );
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};

