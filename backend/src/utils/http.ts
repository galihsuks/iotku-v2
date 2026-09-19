import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";
import { AppError } from "./app-error.js";

export interface ApiPagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export const success = <T>(res: Response, message: string, data?: T, pagination?: ApiPagination) =>
  res.json({ message, data, pagination });

export const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };

export const validate = <T>(schema: ZodType<T>, value: unknown): T => {
  return schema.parse(value);
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(422).json({
      message: "Validation failed.",
      data: {
        message: error.issues.map((issue) => issue.message).join(", "),
        issues: error.issues,
      },
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      data: error.details === undefined ? undefined : { details: error.details },
    });
  }

  console.error(error);
  return res.status(500).json({ message: "There's a problem with the server, Contact us!" });
};
