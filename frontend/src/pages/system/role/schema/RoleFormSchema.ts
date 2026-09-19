import { z } from "zod";

export const roleFormSchema = z.object({
  code: z
    .string()
    .min(1, "Role code must be at least 2 characters.")
    .max(50, "Role code must not exceed 50 characters.")
    .transform((value) => value.toUpperCase()),
  name: z
    .string()
    .min(2, "Role name must be at least 2 characters.")
    .max(100, "Role name must not exceed 100 characters."),
  description: z
    .string()
    .max(255, "Description must not exceed 255 characters.")
    .optional()
    .or(z.literal("")),
});

export type RoleFormSchemaType = z.infer<typeof roleFormSchema>;
