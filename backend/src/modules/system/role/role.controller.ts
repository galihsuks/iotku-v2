import { asyncHandler, success, validate } from "../../../utils/http.js";
import { param } from "../../../utils/params.js";
import { keywordQuerySchema, roleSchema } from "../system.schemas.js";
import * as roleService from "./role.service.js";

export const listRoles = asyncHandler(async (req, res) => {
  const query = validate(keywordQuerySchema, req.query);
  const result = await roleService.listRoles(query);
  return success(res, "List role", result.rows, result.pagination);
});

export const getRole = asyncHandler(async (req, res) =>
  success(res, "Role detail", await roleService.getRole(param(req, "id"))),
);

export const createRole = asyncHandler(async (req, res) =>
  success(
    res,
    "Role created successfully.",
    await roleService.saveRole(validate(roleSchema, req.body)),
  ),
);

export const updateRole = asyncHandler(async (req, res) =>
  success(
    res,
    "Role updated successfully.",
    await roleService.saveRole(validate(roleSchema, req.body), param(req, "id")),
  ),
);

export const deleteRole = asyncHandler(async (req, res) =>
  success(res, "Role deleted successfully.", await roleService.deleteRole(param(req, "id"))),
);
