import { z } from "zod";

export const userPasswordSchema = z
  .object({
    new_password: z
      .string()
      .min(6, "New password must be at least 6 characters.")
      .max(255, "New password must not exceed 255 characters."),
    confirm_password: z
      .string()
      .min(6, "Password confirmation must be at least 6 characters.")
      .max(255, "Password confirmation must not exceed 255 characters."),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    message: "Password confirmation does not match.",
    path: ["confirm_password"],
  });

export type UserPasswordSchemaType = z.infer<typeof userPasswordSchema>;
