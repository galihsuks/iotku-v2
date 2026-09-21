import { useMutation, useQuery } from "@tanstack/react-query";
import type { SensorUnitPayload, SensorUnitQuery } from "../../interfaces/sensor";
import { queryKeys } from "../queryKeys";
import { sensorUnitApi } from "./sensorUnitApi";

export const useSensorUnitListQuery = (params?: SensorUnitQuery) => {
  return useQuery({
    queryKey: queryKeys.sensorUnit.list(params),
    queryFn: () => sensorUnitApi.index(params),
  });
};

export const useCreateSensorUnitMutation = () => {
  return useMutation({
    mutationFn: (payload: SensorUnitPayload) => sensorUnitApi.create(payload),
  });
};
