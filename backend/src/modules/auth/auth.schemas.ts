import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3).max(150),
  password: z.string().min(6).max(255),
});

export const signupSchema = z
  .object({
    username: z.string().trim().min(3).max(100),
    full_name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(150),
    password: z.string().min(6).max(255),
    confirm_password: z.string().min(6).max(255),
  })
  .refine((value) => value.password === value.confirm_password, {
    message: "Konfirmasi password tidak sama.",
    path: ["confirm_password"],
  });

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(6).max(255),
    new_password: z.string().min(6).max(255),
    confirm_password: z.string().min(6).max(255),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    message: "Konfirmasi password baru tidak sama.",
    path: ["confirm_password"],
  });
