import { asyncHandler, success } from "../../utils/http.js";
import * as dropdownService from "./dropdown.service.js";

const getKeywords = (value: unknown) => String(value ?? "").trim();

export const dropdownRoles = asyncHandler(async (req, res) => {
  const keywords = getKeywords(req.query.keywords);
  return success(res, "Role dropdown", await dropdownService.dropdownRoles(keywords));
});

export const dropdownUsers = asyncHandler(async (req, res) => {
  const keywords = getKeywords(req.query.keywords);
  return success(res, "User dropdown", await dropdownService.dropdownUsers(keywords));
});

export const dropdownSensorUnits = asyncHandler(async (req, res) => {
  const keywords = getKeywords(req.query.keywords);
  return success(res, "Sensor unit dropdown", await dropdownService.dropdownSensorUnits(keywords));
});

export const dropdownSensors = asyncHandler(async (req, res) => {
  const keywords = getKeywords(req.query.keywords);
  return success(
    res,
    "Sensor dropdown",
    await dropdownService.dropdownSensors(keywords, req.user?.id ?? ""),
  );
});
