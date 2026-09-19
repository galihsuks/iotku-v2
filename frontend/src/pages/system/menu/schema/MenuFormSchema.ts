import { z } from "zod";

export const menuFormSchema = z.object({
  parent_menu_id: z.string().optional(),
  name: z.string().min(2, "Menu name must be at least 2 characters.").max(100, "Menu name must not exceed 100 characters."),
  description: z
    .string()
    .max(255, "Description must not exceed 255 characters.")
    .optional()
    .or(z.literal("")),
  url: z.string().max(255, "URL must not exceed 255 characters.").optional().or(z.literal("")),
  group: z.enum(["main", "system"], {
    message: "Menu group must be either main or system.",
  }),
  icon: z.string().max(100, "Icon must not exceed 100 characters.").optional().or(z.literal("")),
  display: z.enum(["1", "0"], {
    message: "Display value is required.",
  }),
  sort: z
    .string()
    .min(1, "Sort order is required.")
    .refine((value) => /^-?\d+$/.test(value), "Sort order must be an integer."),
});

export type MenuFormSchemaType = z.infer<typeof menuFormSchema>;
