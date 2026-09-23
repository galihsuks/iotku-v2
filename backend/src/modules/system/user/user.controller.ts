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
  return success(res, "List user berhasil dimuat.", result.rows, result.pagination);
});

export const getUser = asyncHandler(async (req, res) =>
  success(res, "Detail user berhasil dimuat.", await userService.getUserDetail(param(req, "id"))),
);

export const createUser = asyncHandler(async (req, res) =>
  success(
    res,
    "User berhasil dibuat.",
    await userService.createUser(validate(userCreateSchema, req.body)),
  ),
);

export const updateUser = asyncHandler(async (req, res) =>
  success(
    res,
    "User berhasil diperbarui.",
    await userService.updateUser(param(req, "id"), validate(userUpdateSchema, req.body)),
  ),
);

export const deleteUser = asyncHandler(async (req, res) =>
  success(res, "User berhasil dihapus.", await userService.deleteUser(param(req, "id"))),
);

export const changeUserPassword = asyncHandler(async (req, res) => {
  const body = validate(userPasswordSchema, req.body);
  await userService.changeUserPassword(param(req, "id"), body.new_password);
  return success(res, "Password berhasil diperbarui.", null);
});
