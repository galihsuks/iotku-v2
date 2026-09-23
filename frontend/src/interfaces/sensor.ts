import type { ID, KeywordPaginationQuery, PaginationQuery } from "./common";

export type SensorValueType = "number" | "string";
export type SensorWidgetType = "numeric_card" | "chart" | "gauge" | "switch" | "status";

export interface SensorUnit {
  id: ID;
  name: string;
  unit: string;
  value_type: SensorValueType;
  widget_type: SensorWidgetType;
  created_at: string | null;
  updated_at: string | null;
}

export interface Sensor {
  id: ID;
  code: string;
  label: string;
  passkey?: string;
  unit_id: ID;
  unit_name: string;
  unit: string;
  value_type: SensorValueType;
  widget_type: SensorWidgetType;
  owner_user_id: ID;
  owner_name: string;
  created_at: string | null;
  updated_at: string | null;
  latest_reading?: SensorReading | null;
  shared_users?: Array<{ id: ID; email: string; full_name: string }>;
}

export interface SensorReading {
  id: ID;
  sensor_id: ID;
  recorded_at_ms: number;
  value: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface SensorPayload {
  label: string;
  passkey?: string;
  unit_id: ID;
  owner_user_id?: ID;
  shared_user_ids?: ID[];
}

export interface SensorJoinPayload {
  sensor_code: string;
  passkey: string;
}

export interface SensorUnitPayload {
  name: string;
  unit: string;
  value_type: SensorValueType;
  widget_type: SensorWidgetType;
}

export type SensorQuery = KeywordPaginationQuery;
export type SensorUnitQuery = KeywordPaginationQuery;
export type SensorReadingQuery = PaginationQuery;

export interface DeviceInfo {
  sensor_code: string;
  connection_status: boolean;
  ip_device: string | null;
  connected_at: string | null;
}

export interface SensorReadingSocketMessage {
  type: "sensor_reading";
  success: boolean;
  message: string;
  data: {
    sensor_code: string;
    reading: SensorReading;
  };
}

export interface DeviceInfoSocketMessage {
  type: "device_info";
  success: boolean;
  message: string;
  data: DeviceInfo[];
}

export type SensorSocketMessage = SensorReadingSocketMessage | DeviceInfoSocketMessage;
