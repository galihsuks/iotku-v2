import { asyncHandler, success, validate } from "../../../utils/http.js";
import { param } from "../../../utils/params.js";
import {
  keywordQuerySchema,
  userCreateSchema,
  userPasswordSchema,
  userUpdateSchema,
} from "../system.schemas.js";
import * as userService from "./user.service.js";

export const listUsers = asyncHandler(async (req, res) => {
  const query = validate(keywordQuerySchema, req.query);
  const result = await userService.listUsers(query);
  return success(res, "List user", result.rows, result.pagination);
});

export const getUser = asyncHandler(async (req, res) =>
  success(res, "User detail", await userService.getUserDetail(param(req, "id"))),
);

export const createUser = asyncHandler(async (req, res) =>
  success(
    res,
    "User created successfully.",
    await userService.createUser(validate(userCreateSchema, req.body)),
  ),
);

export const updateUser = asyncHandler(async (req, res) =>
  success(
    res,
    "User updated successfully.",
    await userService.updateUser(param(req, "id"), validate(userUpdateSchema, req.body)),
  ),
);

export const deleteUser = asyncHandler(async (req, res) =>
  success(res, "User deleted successfully.", await userService.deleteUser(param(req, "id"))),
);

export const changeUserPassword = asyncHandler(async (req, res) => {
  const body = validate(userPasswordSchema, req.body);
  await userService.changeUserPassword(param(req, "id"), body.new_password);
  return success(res, "Password updated successfully.", null);
});
