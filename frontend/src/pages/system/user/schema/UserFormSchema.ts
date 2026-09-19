import { z } from "zod";

export const createUserFormSchema = (requirePassword: boolean) =>
  z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(100, "Username must not exceed 100 characters."),
    full_name: z
      .string()
      .min(3, "Full name must be at least 3 characters.")
      .max(100, "Full name must not exceed 100 characters."),
    email: z
      .string()
      .email("Email format is invalid.")
      .max(150, "Email must not exceed 150 characters."),
    password: requirePassword
      ? z
          .string()
          .min(6, "Password must be at least 6 characters.")
          .max(255, "Password must not exceed 255 characters.")
      : z
          .string()
          .max(255, "Password must not exceed 255 characters.")
          .optional()
          .or(z.literal("")),
    role_id: z.string().min(1, "Role is required."),
  });

export type UserFormSchemaType = z.infer<ReturnType<typeof createUserFormSchema>>;
