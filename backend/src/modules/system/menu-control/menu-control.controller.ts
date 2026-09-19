import { asyncHandler, success, validate } from "../../../utils/http.js";
import { param } from "../../../utils/params.js";
import { menuControlSchema } from "../system.schemas.js";
import * as menuControlService from "./menu-control.service.js";

export const listMenuControls = asyncHandler(async (req, res) =>
  success(
    res,
    "List menu control",
    await menuControlService.listMenuControls(param(req, "menuId")),
  ),
);

export const createMenuControl = asyncHandler(async (req, res) =>
  success(
    res,
    "Menu control created successfully.",
    await menuControlService.saveMenuControl(validate(menuControlSchema, req.body)),
  ),
);

export const updateMenuControl = asyncHandler(async (req, res) =>
  success(
    res,
    "Menu control updated successfully.",
    await menuControlService.saveMenuControl(
      validate(menuControlSchema, req.body),
      param(req, "id"),
    ),
  ),
);

export const deleteMenuControl = asyncHandler(async (req, res) =>
  success(
    res,
    "Menu control deleted successfully.",
    await menuControlService.deleteMenuControl(param(req, "id")),
  ),
);
