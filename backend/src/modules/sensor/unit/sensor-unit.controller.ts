import { keywordQuerySchema } from "../../system/system.schemas.js";
import { asyncHandler, success, validate } from "../../../utils/http.js";
import { param } from "../../../utils/params.js";
import { sensorUnitSchema } from "../sensor.schemas.js";
import * as sensorUnitService from "./sensor-unit.service.js";

export const listUnits = asyncHandler(async (req, res) => {
  const query = validate(keywordQuerySchema, req.query);
  const result = await sensorUnitService.listUnits(query);
  return success(res, "List sensor unit", result.rows, result.pagination);
});

export const createUnit = asyncHandler(async (req, res) =>
  success(
    res,
    "Sensor unit created successfully.",
    await sensorUnitService.saveUnit(validate(sensorUnitSchema, req.body)),
  ),
);

export const updateUnit = asyncHandler(async (req, res) =>
  success(
    res,
    "Sensor unit updated successfully.",
    await sensorUnitService.saveUnit(validate(sensorUnitSchema, req.body), param(req, "id")),
  ),
);

export const deleteUnit = asyncHandler(async (req, res) =>
  success(
    res,
    "Sensor unit deleted successfully.",
    await sensorUnitService.deleteUnit(param(req, "id")),
  ),
);
