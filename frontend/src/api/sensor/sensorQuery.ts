import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  SensorJoinPayload,
  SensorPayload,
  SensorQuery,
  SensorReadingQuery,
} from "../../interfaces/sensor";
import { queryKeys } from "../queryKeys";
import { sensorApi } from "./sensorApi";

export const useSensorListQuery = (params?: SensorQuery) => {
  return useQuery({
    queryKey: queryKeys.sensor.list(params),
    queryFn: () => sensorApi.index(params),
  });
};

export const useSensorDetailQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.sensor.detail(id),
    queryFn: () => sensorApi.detail(id),
    enabled: Boolean(id),
  });
};

export const useSensorReadingsQuery = (id: string, params?: SensorReadingQuery) => {
  return useQuery({
    queryKey: queryKeys.sensor.readings(id, params),
    queryFn: () => sensorApi.readings(id, params),
    enabled: Boolean(id),
  });
};

export const useCreateSensorMutation = () => {
  return useMutation({
    mutationFn: (payload: SensorPayload) => sensorApi.create(payload),
  });
};

export const useJoinSensorMutation = () => {
  return useMutation({
    mutationFn: (payload: SensorJoinPayload) => sensorApi.join(payload),
  });
};

export const useUpdateSensorMutation = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SensorPayload }) =>
      sensorApi.update(id, payload),
  });
};

export const useDeleteSensorMutation = () => {
  return useMutation({
    mutationFn: (id: string) => sensorApi.delete(id),
  });
};

export const useCreateSensorReadingMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { value: string | number | boolean; recorded_at_ms?: number };
    }) => sensorApi.createReading(id, payload),
  });
};
