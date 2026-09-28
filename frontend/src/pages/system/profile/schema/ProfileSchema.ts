import { z } from "zod";

export const profileSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters.").max(100),
  full_name: z.string().trim().min(1, "Full name is required.").max(100),
  email: z.string().trim().email("Email format is invalid.").max(150),
});

export const profilePasswordSchema = z
  .object({
    current_password: z.string().min(6, "Current password must be at least 6 characters."),
    new_password: z.string().min(6, "New password must be at least 6 characters."),
    confirm_password: z.string().min(6, "Password confirmation must be at least 6 characters."),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    message: "New password confirmation does not match.",
    path: ["confirm_password"],
  });

export type ProfileSchemaType = z.infer<typeof profileSchema>;
export type ProfilePasswordSchemaType = z.infer<typeof profilePasswordSchema>;
