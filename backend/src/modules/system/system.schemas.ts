import { z } from "zod";

export const keywordQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  page_size: z.coerce.number().int().positive().max(100).optional(),
  keywords: z.string().trim().optional(),
});

export const websocketLogQuerySchema = keywordQuerySchema.extend({
  level: z.enum(["info", "warning", "error"]).or(z.literal("")).optional(),
  date: z.string().trim().optional(),
  start_time: z.string().trim().optional(),
  end_time: z.string().trim().optional(),
});

export const roleSchema = z.object({
  code: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(255).nullable().optional().or(z.literal("")),
});

export const parameterSchema = z.object({
  key: z.string().trim().min(1).max(120),
  value: z.string().trim().max(1000),
  datatype: z.enum(["string", "number", "json", "boolean"]),
});

export const menuSchema = z.object({
  parent_menu_id: z.string().trim().nullable().optional().or(z.literal("")),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(255).nullable().optional().or(z.literal("")),
  url: z.string().trim().max(255).nullable().optional().or(z.literal("")),
  group: z.enum(["main", "system"]),
  icon: z.string().trim().max(100).nullable().optional().or(z.literal("")),
  display: z.union([z.literal("0"), z.literal("1"), z.literal(0), z.literal(1), z.boolean()]),
  sort: z.coerce.number().int().min(0),
});

export const menuControlSchema = z.object({
  menu_id: z.string().trim().min(1),
  code: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(100),
});

export const roleMenuControlSchema = z.object({
  role_id: z.string().trim().min(1),
  data: z.array(
    z.object({
      menu_id: z.string().trim().min(1),
      menu_control_id: z.string().trim().min(1),
      value: z.boolean(),
    }),
  ),
});

export const userCreateSchema = z.object({
  username: z.string().trim().min(3).max(100),
  full_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(150),
  password: z.string().min(6).max(255),
  role_id: z.string().trim().min(1),
});

export const userUpdateSchema = userCreateSchema.omit({ password: true }).extend({
  password: z.string().min(6).max(255).optional().or(z.literal("")),
  role_id: z.string().trim().min(1).optional(),
});

export const userPasswordSchema = z
  .object({
    new_password: z.string().min(6).max(255),
    confirm_password: z.string().min(6).max(255),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    message: "Konfirmasi password tidak sama.",
    path: ["confirm_password"],
  });

export const logPayloadSchema = z.object({
  level: z.enum(["info", "warning", "error"]).default("info"),
  message: z.string().trim().min(1),
  context: z.record(z.string(), z.unknown()).optional(),
});
