import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { accessApi } from "./accessApi";

export const useAccessMenuQuery = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.access.menu,
    queryFn: accessApi.getMenu,
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useAccessControlQuery = (menuId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.access.control(menuId),
    queryFn: () => accessApi.getControlCodes(menuId),
    enabled: enabled && Boolean(menuId),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
