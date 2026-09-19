import { asyncHandler, success, validate } from "../../../utils/http.js";
import { keywordQuerySchema, logPayloadSchema } from "../system.schemas.js";
import * as logService from "./log.service.js";

export const createLog = asyncHandler(async (req, res) => {
  const body = validate(logPayloadSchema, req.body);
  await logService.createLog({ ...body, ipAddress: req.ip ?? null });
  return success(res, "Log created successfully.", undefined);
});

export const listLogs = asyncHandler(async (req, res) => {
  const query = validate(keywordQuerySchema, req.query);
  const result = await logService.listLogs(query);
  return success(res, "List log", result.rows, result.pagination);
});

export const clearLogs = asyncHandler(async (_req, res) => {
  await logService.clearLogs();
  return success(res, "Logs cleared successfully.", undefined);
});
