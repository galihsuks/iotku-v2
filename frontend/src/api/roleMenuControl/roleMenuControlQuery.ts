import { useMutation, useQuery } from "@tanstack/react-query";
import type { RoleMenuControlPayload } from "../../interfaces/roleMenuControl";
import { queryKeys } from "../queryKeys";
import { roleMenuControlApi } from "./roleMenuControlApi";

export const useRoleMenuControlListQuery = (roleId: string) => {
  return useQuery({
    queryKey: queryKeys.roleMenuControl.list(roleId),
    queryFn: () => roleMenuControlApi.indexByRoleId(roleId),
    enabled: Boolean(roleId),
  });
};

export const useUpdateRoleMenuControlMutation = () => {
  return useMutation({
    mutationFn: (payload: RoleMenuControlPayload) => roleMenuControlApi.updateByChanges(payload),
  });
};
