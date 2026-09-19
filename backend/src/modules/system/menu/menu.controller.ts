import { asyncHandler, success, validate } from "../../../utils/http.js";
import { param } from "../../../utils/params.js";
import { menuSchema } from "../system.schemas.js";
import * as menuService from "./menu.service.js";

export const listMenus = asyncHandler(async (_req, res) =>
  success(res, "List menu", await menuService.listMenus()),
);

export const getMenu = asyncHandler(async (req, res) =>
  success(res, "Menu detail", await menuService.getMenu(param(req, "id"))),
);

export const createMenu = asyncHandler(async (req, res) =>
  success(
    res,
    "Menu created successfully.",
    await menuService.saveMenu(validate(menuSchema, req.body)),
  ),
);

export const updateMenu = asyncHandler(async (req, res) =>
  success(
    res,
    "Menu updated successfully.",
    await menuService.saveMenu(validate(menuSchema, req.body), param(req, "id")),
  ),
);

export const deleteMenu = asyncHandler(async (req, res) =>
  success(
    res,
    "Menu deleted successfully.",
    await menuService.deleteMenu(param(req, "id"), req.query.force_delete === "1"),
  ),
);
