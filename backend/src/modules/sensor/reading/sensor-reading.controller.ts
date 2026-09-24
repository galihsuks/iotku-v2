import { keywordQuerySchema } from "../../system/system.schemas.js";
import { asyncHandler, success, validate } from "../../../utils/http.js";
import { param } from "../../../utils/params.js";
import { readingSchema } from "../sensor.schemas.js";
import * as sensorReadingService from "./sensor-reading.service.js";

export const listReadings = asyncHandler(async (req, res) => {
  const query = validate(keywordQuerySchema, req.query);
  const result = await sensorReadingService.listReadings(
    param(req, "id"),
    query,
    req.user?.id ?? "",
  );
  return success(res, "List sensor reading", result.rows, result.pagination);
});

export const exportReadings = asyncHandler(async (req, res) => {
  const result = await sensorReadingService.exportReadings(param(req, "id"), req.user?.id ?? "");

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  return res.send(Buffer.from(result.buffer));
});

export const createReading = asyncHandler(async (req, res) =>
  success(
    res,
    "Sensor reading created successfully.",
    req.user?.id
      ? await sensorReadingService.createReadingForUser(
          param(req, "id"),
          validate(readingSchema, req.body),
          req.user.id,
        )
      : await sensorReadingService.createReading(
          param(req, "id"),
          validate(readingSchema, req.body),
    ),
  ),
);

export const resetReadings = asyncHandler(async (req, res) =>
  success(
    res,
    "Data sensor berhasil direset.",
    await sensorReadingService.resetReadings(param(req, "id"), req.user?.id ?? ""),
  ),
);
