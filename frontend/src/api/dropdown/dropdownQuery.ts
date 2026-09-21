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

export const useSensorDropdownQuery = (keywords = "", enabled = true) => {
  return useQuery({
    queryKey: queryKeys.dropdown.sensor(keywords),
    queryFn: () => dropdownApi.sensor(keywords),
    enabled,
  });
};

export const useSensorUnitDropdownQuery = (keywords = "", enabled = true) => {
  return useQuery({
    queryKey: queryKeys.dropdown.sensorUnit(keywords),
    queryFn: () => dropdownApi.sensorUnit(keywords),
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
