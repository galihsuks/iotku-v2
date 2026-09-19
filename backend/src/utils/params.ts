import type { Request } from "express";

export const param = (req: Request, key: string) => {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : String(value ?? "");
};
