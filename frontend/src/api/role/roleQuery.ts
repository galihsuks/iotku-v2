import { useMutation, useQuery } from "@tanstack/react-query";
import type { KeywordPaginationQuery } from "../../interfaces/common";
import type { RolePayload } from "../../interfaces/role";
import { queryKeys } from "../queryKeys";
import { roleApi } from "./roleApi";

export const useRoleListQuery = (params?: KeywordPaginationQuery) => {
  return useQuery({
    queryKey: queryKeys.role.list(params),
    queryFn: () => roleApi.index(params),
  });
};

export const useRoleDetailQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.role.detail(id),
    queryFn: () => roleApi.detail(id),
    enabled: Boolean(id),
  });
};

export const useCreateRoleMutation = () => {
  return useMutation({
    mutationFn: (payload: RolePayload) => roleApi.create(payload),
  });
};

export const useUpdateRoleMutation = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RolePayload }) => roleApi.update(id, payload),
  });
};

export const useDeleteRoleMutation = () => {
  return useMutation({
    mutationFn: (id: string) => roleApi.delete(id),
  });
};
