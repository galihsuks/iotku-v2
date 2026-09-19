import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3).max(150),
  password: z.string().min(6).max(255),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(6).max(255),
    new_password: z.string().min(6).max(255),
    confirm_password: z.string().min(6).max(255),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    message: "New password confirmation does not match.",
    path: ["confirm_password"],
  });
