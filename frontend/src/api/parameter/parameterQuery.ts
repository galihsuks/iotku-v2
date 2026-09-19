import { useMutation, useQuery } from "@tanstack/react-query";
import type { ParameterPayload, ParameterQuery } from "../../interfaces/parameter";
import { queryKeys } from "../queryKeys";
import { parameterApi } from "./parameterApi";

export const useParameterListQuery = (params?: ParameterQuery) => {
  return useQuery({
    queryKey: queryKeys.parameter.list(params),
    queryFn: () => parameterApi.index(params),
  });
};

export const useParameterDetailQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.parameter.detail(id),
    queryFn: () => parameterApi.detail(id),
    enabled: Boolean(id),
  });
};

export const useCreateParameterMutation = () => {
  return useMutation({
    mutationFn: (payload: ParameterPayload) => parameterApi.create(payload),
  });
};

export const useUpdateParameterMutation = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ParameterPayload }) =>
      parameterApi.update(id, payload),
  });
};

export const useDeleteParameterMutation = () => {
  return useMutation({
    mutationFn: (id: string) => parameterApi.delete(id),
  });
};
