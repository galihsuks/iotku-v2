import { z } from "zod";

export const menuControlFormSchema = z.object({
  code: z
    .string()
    .min(1, "Control code is required.")
    .max(100, "Control code must not exceed 100 characters.")
    .transform((value) => value.toUpperCase()),
  name: z
    .string()
    .min(2, "Control name must be at least 2 characters.")
    .max(100, "Control name must not exceed 100 characters."),
});

export type MenuControlFormSchemaType = z.infer<typeof menuControlFormSchema>;
