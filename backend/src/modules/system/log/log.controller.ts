import { asyncHandler, success, validate } from "../../../utils/http.js";
import { logPayloadSchema, logQuerySchema } from "../system.schemas.js";
import * as logService from "./log.service.js";

export const createLog = asyncHandler(async (req, res) => {
  const body = validate(logPayloadSchema, req.body);
  await logService.createLog({ ...body, ipAddress: req.ip ?? null });
  return success(res, "Log created successfully.", undefined);
});

export const listLogs = asyncHandler(async (req, res) => {
  const query = validate(logQuerySchema, req.query);
  const result = await logService.listLogs(query);
  return success(res, "List log", result.rows, result.pagination);
});

export const clearLogs = asyncHandler(async (req, res) => {
  const query = validate(logQuerySchema, req.query);
  await logService.clearLogs(query);
  return success(res, "Logs cleared successfully.", undefined);
});
