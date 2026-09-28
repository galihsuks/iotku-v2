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

const fieldLabels: Record<string, string> = {
  code: "Code",
  confirm_password: "Password confirmation",
  context: "Context",
  current_password: "Current password",
  data: "Data",
  datatype: "Data type",
  description: "Description",
  display: "Display",
  email: "Email",
  full_name: "Full name",
  group: "Group",
  icon: "Icon",
  key: "Key",
  keywords: "Keywords",
  label: "Sensor name",
  level: "Level",
  menu_control_id: "Menu control",
  menu_id: "Menu",
  message: "Message",
  name: "Name",
  new_password: "New password",
  page: "Page",
  page_size: "Rows per page",
  parent_menu_id: "Parent menu",
  passkey: "Passkey",
  password: "Password",
  recorded_at_ms: "Recorded time",
  role_id: "Role",
  sensor_code: "Sensor code",
  shared_user_ids: "Shared users",
  sort: "Sort order",
  unit: "Unit",
  unit_id: "Unit sensor",
  url: "URL",
  username: "Username",
  value: "Value",
  value_type: "Value type",
  widget_type: "Widget type",
};

const humanizeFieldName = (fieldName: string) =>
  fieldName
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getIssueField = (issue: ZodError["issues"][number]) => {
  const path = issue.path
    .filter((item) => typeof item === "string" || typeof item === "number")
    .map(String);
  const lastPath = path.at(-1) ?? "";

  return fieldLabels[lastPath] ?? humanizeFieldName(lastPath || "Input");
};

const translateCustomMessage = (message: string) => {
  const customMessages: Record<string, string> = {
    "New password confirmation does not match.": "New password confirmation does not match.",
    "Password confirmation does not match.": "Password confirmation does not match.",
  };

  return customMessages[message] ?? message;
};

const formatZodIssue = (issue: ZodError["issues"][number]) => {
  const field = getIssueField(issue);
  const detail = issue as typeof issue & {
    expected?: string;
    format?: string;
    maximum?: number;
    minimum?: number;
    origin?: string;
    options?: unknown[];
  };

  if (issue.code === "custom") {
    return translateCustomMessage(issue.message);
  }

  if (issue.code === "invalid_type") {
    return `${field} is required.`;
  }

  if (issue.code === "invalid_format") {
    if (detail.format === "email") {
      return `${field} must be a valid email address.`;
    }

    return `${field} has an invalid format.`;
  }

  if (issue.code === "invalid_value") {
    return `${field} is invalid. Please choose an available value.`;
  }

  if (issue.code === "too_small") {
    if (detail.origin === "string") {
      if (Number(detail.minimum ?? 0) <= 1) {
        return `${field} is required.`;
      }

      return `${field} must be at least ${detail.minimum} characters.`;
    }

    if (detail.origin === "array") {
      return `${field} must contain at least ${detail.minimum} item(s).`;
    }

    return `${field} must be at least ${detail.minimum}.`;
  }

  if (issue.code === "too_big") {
    if (detail.origin === "string") {
      return `${field} must be at most ${detail.maximum} characters.`;
    }

    if (detail.origin === "array") {
      return `${field} must contain at most ${detail.maximum} item(s).`;
    }

    return `${field} must be at most ${detail.maximum}.`;
  }

  return translateCustomMessage(issue.message) || `${field} is invalid.`;
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    const messages = error.issues.map(formatZodIssue);
    const message = messages[0] ?? "Input is invalid.";

    return res.status(422).json({
      message,
      data: {
        message: messages.join(", "),
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
