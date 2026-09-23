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
  confirm_password: "Konfirmasi password",
  context: "Context",
  current_password: "Password saat ini",
  data: "Data",
  datatype: "Tipe data",
  description: "Deskripsi",
  display: "Display",
  email: "Email",
  full_name: "Nama lengkap",
  group: "Group",
  icon: "Icon",
  key: "Key",
  keywords: "Kata kunci",
  label: "Nama sensor",
  level: "Level",
  menu_control_id: "Menu control",
  menu_id: "Menu",
  message: "Pesan",
  name: "Nama",
  new_password: "Password baru",
  page: "Halaman",
  page_size: "Jumlah data per halaman",
  parent_menu_id: "Parent menu",
  passkey: "Passkey",
  password: "Password",
  recorded_at_ms: "Waktu rekam",
  role_id: "Role",
  sensor_code: "Kode sensor",
  shared_user_ids: "User yang dibagikan",
  sort: "Urutan",
  unit: "Satuan",
  unit_id: "Unit sensor",
  url: "URL",
  username: "Username",
  value: "Nilai",
  value_type: "Tipe nilai",
  widget_type: "Tipe widget",
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
    "New password confirmation does not match.": "Konfirmasi password baru tidak sama.",
    "Password confirmation does not match.": "Konfirmasi password tidak sama.",
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
    return `${field} wajib diisi.`;
  }

  if (issue.code === "invalid_format") {
    if (detail.format === "email") {
      return `${field} harus berupa email yang valid.`;
    }

    return `${field} memiliki format yang tidak valid.`;
  }

  if (issue.code === "invalid_value") {
    return `${field} tidak valid. Silakan pilih nilai yang tersedia.`;
  }

  if (issue.code === "too_small") {
    if (detail.origin === "string") {
      if (Number(detail.minimum ?? 0) <= 1) {
        return `${field} wajib diisi.`;
      }

      return `${field} minimal ${detail.minimum} karakter.`;
    }

    if (detail.origin === "array") {
      return `${field} minimal berisi ${detail.minimum} data.`;
    }

    return `${field} minimal ${detail.minimum}.`;
  }

  if (issue.code === "too_big") {
    if (detail.origin === "string") {
      return `${field} maksimal ${detail.maximum} karakter.`;
    }

    if (detail.origin === "array") {
      return `${field} maksimal berisi ${detail.maximum} data.`;
    }

    return `${field} maksimal ${detail.maximum}.`;
  }

  return translateCustomMessage(issue.message) || `${field} tidak valid.`;
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    const messages = error.issues.map(formatZodIssue);
    const message = messages[0] ?? "Input belum sesuai.";

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
