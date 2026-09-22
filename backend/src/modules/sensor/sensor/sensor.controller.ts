import { keywordQuerySchema } from "../../system/system.schemas.js";
import { asyncHandler, success, validate } from "../../../utils/http.js";
import { param } from "../../../utils/params.js";
import { sensorJoinSchema, sensorSchema } from "../sensor.schemas.js";
import * as sensorService from "./sensor.service.js";

export const listSensors = asyncHandler(async (req, res) => {
  const query = validate(keywordQuerySchema, req.query);
  const result = await sensorService.listSensors(query, req.user?.id ?? "");
  return success(res, "List sensor", result.rows, result.pagination);
});

export const getSensor = asyncHandler(async (req, res) =>
  success(
    res,
    "Sensor detail",
    await sensorService.getSensorDetail(param(req, "id"), req.user?.id ?? ""),
  ),
);

export const createSensor = asyncHandler(async (req, res) =>
  success(
    res,
    "Sensor created successfully.",
    await sensorService.saveSensor(validate(sensorSchema, req.body), req.user?.id ?? ""),
  ),
);

export const joinSensor = asyncHandler(async (req, res) =>
  success(
    res,
    "Sensor joined successfully.",
    await sensorService.joinSensor(validate(sensorJoinSchema, req.body), req.user?.id ?? ""),
  ),
);

export const updateSensor = asyncHandler(async (req, res) =>
  success(
    res,
    "Sensor updated successfully.",
    await sensorService.saveSensor(
      validate(sensorSchema, req.body),
      req.user?.id ?? "",
      param(req, "id"),
    ),
  ),
);

export const deleteSensor = asyncHandler(async (req, res) =>
  success(
    res,
    "Sensor deleted successfully.",
    await sensorService.deleteSensor(param(req, "id"), req.user?.id ?? ""),
  ),
);
