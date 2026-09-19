import type { ID, KeywordPaginationQuery } from "./common";

export type ParameterDatatype = "string" | "number" | "json" | "boolean";

export interface Parameter {
  id: ID;
  key: string;
  value: string;
  datatype: ParameterDatatype;
  created_at: string;
  updated_at: string;
}

export interface ParameterPayload {
  key: string;
  value: unknown;
  datatype: ParameterDatatype;
}

export interface ParameterQuery extends KeywordPaginationQuery {}
