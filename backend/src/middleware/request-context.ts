import type { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  const requestId = String(req.headers["x-request-id"] ?? uuidv4());
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
};
