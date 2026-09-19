import { asyncHandler, success } from "../../../utils/http.js";
import { param } from "../../../utils/params.js";
import * as accessService from "./access.service.js";

export const accessMenu = asyncHandler(async (req, res) =>
  success(res, "List menu", await accessService.listReadableMenus(req.user?.role ?? "")),
);

export const accessControl = asyncHandler(async (req, res) =>
  success(
    res,
    "List access control",
    await accessService.listControlCodes(req.user?.role ?? "", param(req, "menuId")),
  ),
);
