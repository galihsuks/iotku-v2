import { env } from "../../config/env.js";
import { asyncHandler, success, validate } from "../../utils/http.js";
import { getBearerToken } from "../../utils/token.js";
import { changePasswordSchema, loginSchema } from "./auth.schemas.js";
import * as authService from "./auth.service.js";

export const login = asyncHandler(async (req, res) => {
  const body = validate(loginSchema, req.body);
  const result = await authService.login(body.username, body.password);
  res.cookie(env.AUTH_COOKIE_NAME, result.token, {
    ...authService.getCookieOptions(),
    maxAge: 24 * 60 * 60 * 1000,
  });
  return success(res, "Login successfully.", result.user);
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user?.id ?? "");
  return success(res, "Authenticated user loaded.", user);
});

export const logout = asyncHandler(async (req, res) => {
  const token =
    getBearerToken(req.header("authorization")) ||
    String(req.cookies?.[env.AUTH_COOKIE_NAME] ?? "");
  await authService.logout(token);
  res.clearCookie(env.AUTH_COOKIE_NAME, authService.getCookieOptions());
  return success(res, "Logout successfully", null);
});

export const changePassword = asyncHandler(async (req, res) => {
  const body = validate(changePasswordSchema, req.body);
  await authService.changeOwnPassword(req.user?.id ?? "", body.current_password, body.new_password);
  return success(res, "Password updated successfully.", null);
});

export const impersonate = asyncHandler(async (_req, res) => {
  return success(res, "Impersonation is not enabled in this app.", null);
});
