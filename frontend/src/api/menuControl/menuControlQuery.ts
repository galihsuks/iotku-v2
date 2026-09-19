import { useMutation, useQuery } from "@tanstack/react-query";
import type { MenuControlPayload } from "../../interfaces/menuControl";
import { queryKeys } from "../queryKeys";
import { menuControlApi } from "./menuControlApi";

export const useMenuControlListQuery = (menuId: string) => {
  return useQuery({
    queryKey: queryKeys.menuControl.list(menuId),
    queryFn: () => menuControlApi.indexByMenuId(menuId),
    enabled: Boolean(menuId),
  });
};

export const useCreateMenuControlMutation = () => {
  return useMutation({
    mutationFn: (payload: MenuControlPayload) => menuControlApi.create(payload),
  });
};

export const useUpdateMenuControlMutation = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MenuControlPayload }) =>
      menuControlApi.update(id, payload),
  });
};

export const useDeleteMenuControlMutation = () => {
  return useMutation({
    mutationFn: (id: string) => menuControlApi.delete(id),
  });
};
