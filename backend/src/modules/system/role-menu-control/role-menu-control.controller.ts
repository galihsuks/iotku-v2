import { asyncHandler, success, validate } from "../../../utils/http.js";
import { param } from "../../../utils/params.js";
import { roleMenuControlSchema } from "../system.schemas.js";
import * as roleMenuControlService from "./role-menu-control.service.js";

export const listRoleAccess = asyncHandler(async (req, res) =>
  success(
    res,
    "List role access",
    await roleMenuControlService.listRoleAccessTree(param(req, "roleId")),
  ),
);

export const updateRoleAccess = asyncHandler(async (req, res) => {
  const body = validate(roleMenuControlSchema, req.body);
  return success(
    res,
    "Role access updated successfully.",
    await roleMenuControlService.updateRoleMenuControls(body.role_id, body.data),
  );
});
