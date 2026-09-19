import { useMutation, useQuery } from "@tanstack/react-query";
import type { UserListQuery } from "../../interfaces/common";
import { queryKeys } from "../queryKeys";
import { userApi } from "./userApi";

export const useUserListQuery = (params?: UserListQuery) => {
  return useQuery({
    queryKey: queryKeys.user.list(params),
    queryFn: () => userApi.index(params),
  });
};

export const useUserDetailQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.user.detail(id),
    queryFn: () => userApi.detail(id),
    enabled: Boolean(id),
  });
};

export const useCreateUserMutation = () => {
  return useMutation({
    mutationFn: userApi.create,
  });
};

export const useUpdateUserMutation = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof userApi.update>[1] }) =>
      userApi.update(id, payload),
  });
};

export const useDeleteUserMutation = () => {
  return useMutation({
    mutationFn: userApi.delete,
  });
};

export const useChangeUserPasswordMutation = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof userApi.changePassword>[1] }) =>
      userApi.changePassword(id, payload),
  });
};
