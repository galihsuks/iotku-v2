import type { PaginationQuery } from "./common";

export type LogLevel = "info" | "warning" | "error";

export interface LogPayload {
  level: LogLevel;
  message: string;
  context?: unknown;
}

export interface LogItem {
  id: string;
  level: LogLevel;
  message: string;
  context: string;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface LogQuery extends PaginationQuery {
  level?: LogLevel | "";
  keywords?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
}
