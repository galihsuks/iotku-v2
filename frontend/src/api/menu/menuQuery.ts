import { useMutation, useQuery } from "@tanstack/react-query";
import type { MenuPayload } from "../../interfaces/menu";
import { queryKeys } from "../queryKeys";
import { menuApi } from "./menuApi";

export const useMenuListQuery = () => {
  return useQuery({
    queryKey: queryKeys.menu.list,
    queryFn: menuApi.index,
  });
};

export const useMenuDetailQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.menu.detail(id),
    queryFn: () => menuApi.detail(id),
    enabled: Boolean(id),
  });
};

export const useCreateMenuMutation = () => {
  return useMutation({
    mutationFn: (payload: MenuPayload) => menuApi.create(payload),
  });
};

export const useUpdateMenuMutation = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MenuPayload }) => menuApi.update(id, payload),
  });
};

export const useDeleteMenuMutation = () => {
  return useMutation({
    mutationFn: ({ id, forceDelete }: { id: string; forceDelete?: boolean }) =>
      menuApi.delete(id, forceDelete),
  });
};
