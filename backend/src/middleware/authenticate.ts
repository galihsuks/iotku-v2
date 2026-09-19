import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { unauthorized } from "../utils/app-error.js";
import { verifyAuthToken } from "../utils/auth.js";

const getBearerToken = (header?: string) => {
  if (!header) return "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
};

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const token =
    getBearerToken(req.header("authorization")) ||
    String(req.cookies?.[env.AUTH_COOKIE_NAME] ?? "");

  if (!token) {
    return next(unauthorized("Unauthorized."));
  }

  try {
    const user = verifyAuthToken(token);
    if (!user.id) {
      return next(unauthorized("Unauthorized."));
    }
    req.user = user;
    return next();
  } catch {
    return next(unauthorized("Unauthorized."));
  }
};
