import type { ApiResponse } from "../../interfaces/api";
import type { User } from "../../interfaces/auth";
import type { ID } from "../../interfaces/common";
import type { ChangeOwnPasswordPayload } from "../../interfaces/user";
import api from "../axios";
import { toApiError } from "../apiError";

export const authApi = {
  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post<ApiResponse<null>>("/api/auth/logout");
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  me: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get<ApiResponse<User>>("/api/auth/me");
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  changePassword: async (payload: ChangeOwnPasswordPayload): Promise<ApiResponse<null>> => {
    try {
      const response = await api.put<ApiResponse<null>>("/api/auth/password", payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  impersonate: async (userId: ID): Promise<ApiResponse<User>> => {
    try {
      const response = await api.post<ApiResponse<User>>(`/api/auth/impersonate/${userId}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};

