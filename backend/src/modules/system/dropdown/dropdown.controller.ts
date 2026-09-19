import { asyncHandler, success } from "../../../utils/http.js";
import * as dropdownService from "./dropdown.service.js";

export const dropdownRoles = asyncHandler(async (req, res) => {
  const keywords = String(req.query.keywords ?? "").trim();
  return success(res, "Role dropdown", await dropdownService.dropdownRoles(keywords));
});

export const dropdownUsers = asyncHandler(async (req, res) => {
  const keywords = String(req.query.keywords ?? "").trim();
  return success(res, "User dropdown", await dropdownService.dropdownUsers(keywords));
});
