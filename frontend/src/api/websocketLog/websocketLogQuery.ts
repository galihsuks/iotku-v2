import { useMutation, useQuery } from "@tanstack/react-query";
import type { LogQuery } from "../../interfaces/log";
import { queryKeys } from "../queryKeys";
import { websocketLogApi } from "./websocketLogApi";

export const useWebSocketLogListQuery = (params?: LogQuery) => {
  return useQuery({
    queryKey: queryKeys.websocketLog.list(params),
    queryFn: () => websocketLogApi.index(params),
  });
};

export const useClearWebSocketLogMutation = () => {
  return useMutation({
    mutationFn: (params?: LogQuery) => websocketLogApi.clear(params),
  });
};
