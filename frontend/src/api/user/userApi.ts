import type { ApiResponse } from "../../interfaces/api";
import type { ID, UserListQuery } from "../../interfaces/common";
import type {
  ChangeUserPasswordPayload,
  CreateUserPayload,
  UpdateUserPayload,
  UserDetail,
  UserListItem,
} from "../../interfaces/user";
import api from "../axios";
import { toApiError } from "../apiError";

export const userApi = {
  index: async (query?: UserListQuery): Promise<ApiResponse<UserListItem[]>> => {
    try {
      const response = await api.get<ApiResponse<UserListItem[]>>("/api/user", { params: query });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  detail: async (id: ID): Promise<ApiResponse<UserDetail>> => {
    try {
      const response = await api.get<ApiResponse<UserDetail>>(`/api/user/${id}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  create: async (payload: CreateUserPayload): Promise<ApiResponse<UserDetail>> => {
    try {
      const response = await api.post<ApiResponse<UserDetail>>("/api/user", payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  update: async (id: ID, payload: UpdateUserPayload): Promise<ApiResponse<UserDetail>> => {
    try {
      const response = await api.put<ApiResponse<UserDetail>>(`/api/user/${id}`, payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  delete: async (id: ID): Promise<ApiResponse<UserDetail>> => {
    try {
      const response = await api.delete<ApiResponse<UserDetail>>(`/api/user/${id}`);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
  changePassword: async (id: ID, payload: ChangeUserPasswordPayload): Promise<ApiResponse<null>> => {
    try {
      const response = await api.put<ApiResponse<null>>(`/api/user/password/${id}`, payload);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};

