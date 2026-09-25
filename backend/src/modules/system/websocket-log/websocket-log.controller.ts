import { asyncHandler, success, validate } from "../../../utils/http.js";
import { websocketLogQuerySchema } from "../system.schemas.js";
import * as websocketLogService from "./websocket-log.service.js";

export const listLogs = asyncHandler(async (req, res) => {
  const query = validate(websocketLogQuerySchema, req.query);
  const result = await websocketLogService.listLogs(query);
  return success(res, "List websocket log", result.rows, result.pagination);
});

export const clearLogs = asyncHandler(async (req, res) => {
  const query = validate(websocketLogQuerySchema, req.query);
  await websocketLogService.clearLogs(query);
  return success(res, "WebSocket logs cleared successfully.", undefined);
});
