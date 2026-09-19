import type { NextFunction, Request, Response } from "express";
import { createLog } from "../modules/system/log/log.service.js";

const SENSITIVE_KEYS = new Set([
  "password",
  "current_password",
  "new_password",
  "confirm_password",
  "token",
  "authorization",
]);

const shouldSkipLog = (req: Request) => {
  if (!req.path.startsWith("/api")) return true;
  if (req.path === "/api/log" && req.method === "POST") return true;
  return false;
};

const sanitizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => [
      key,
      SENSITIVE_KEYS.has(key.toLowerCase()) ? "[REDACTED]" : sanitizeValue(entryValue),
    ]),
  );
};

const getLogLevel = (statusCode: number) => {
  if (statusCode >= 500) return "error";
  if (statusCode >= 400) return "warning";
  return "info";
};

export const apiAuditLogger = (req: Request, res: Response, next: NextFunction) => {
  if (shouldSkipLog(req)) {
    next();
    return;
  }

  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const level = getLogLevel(res.statusCode);

    void createLog({
      level,
      message: `${req.method} ${req.originalUrl} ${res.statusCode}`,
      ipAddress: req.ip ?? null,
      context: {
        request_id: req.requestId ?? null,
        method: req.method,
        path: req.originalUrl,
        status_code: res.statusCode,
        duration_ms: durationMs,
        user_id: req.user?.id ?? null,
        user_role: req.user?.role ?? null,
        query: sanitizeValue(req.query),
        body: sanitizeValue(req.body),
      },
    });
  });

  next();
};
