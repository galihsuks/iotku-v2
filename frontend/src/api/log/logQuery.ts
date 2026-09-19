import { useMutation, useQuery } from "@tanstack/react-query";
import type { LogPayload, LogQuery } from "../../interfaces/log";
import { queryKeys } from "../queryKeys";
import { logApi } from "./logApi";

export const useLogListQuery = (params?: LogQuery) => {
  return useQuery({
    queryKey: queryKeys.log.list(params),
    queryFn: () => logApi.index(params),
  });
};

export const useCreateLogMutation = () => {
  return useMutation({
    mutationFn: (payload: LogPayload) => logApi.create(payload),
  });
};

export const useClearLogMutation = () => {
  return useMutation({
    mutationFn: (params?: LogQuery) => logApi.clear(params),
  });
};
