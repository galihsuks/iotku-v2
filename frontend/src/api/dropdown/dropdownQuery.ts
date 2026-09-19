import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { dropdownApi } from "./dropdownApi";

export const useRoleDropdownQuery = (keywords = "", enabled = true) => {
  return useQuery({
    queryKey: queryKeys.dropdown.role(keywords),
    queryFn: () => dropdownApi.role(keywords),
    enabled,
  });
};

export const useUserDropdownQuery = (keywords = "", enabled = true) => {
  return useQuery({
    queryKey: queryKeys.dropdown.user(keywords),
    queryFn: () => dropdownApi.user(keywords),
    enabled,
  });
};
