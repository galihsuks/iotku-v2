import { z } from "zod";

export const profileSchema = z.object({
  username: z.string().trim().min(3, "Username minimal 3 karakter.").max(100),
  full_name: z.string().trim().min(1, "Nama lengkap wajib diisi.").max(100),
  email: z.string().trim().email("Format email tidak valid.").max(150),
});

export const profilePasswordSchema = z
  .object({
    current_password: z.string().min(6, "Password saat ini minimal 6 karakter."),
    new_password: z.string().min(6, "Password baru minimal 6 karakter."),
    confirm_password: z.string().min(6, "Konfirmasi password minimal 6 karakter."),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    message: "Konfirmasi password baru tidak sama.",
    path: ["confirm_password"],
  });

export type ProfileSchemaType = z.infer<typeof profileSchema>;
export type ProfilePasswordSchemaType = z.infer<typeof profilePasswordSchema>;
