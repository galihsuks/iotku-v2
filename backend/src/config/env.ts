import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  APP_NAME: z.string().default("Iotku V2 API"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8082),
  WS_PORT: z.coerce.number().int().positive().default(4002),
  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),
  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().default("iotku_v2"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  AUTH_COOKIE_NAME: z.string().default("auth_token"),
  SUPER_ADMIN_EMAIL: z.string().email().default("admin@iotku.test"),
  SUPER_ADMIN_PASSWORD: z.string().min(6).default("password123"),
  WS_ADMIN_KEY: z.string().min(8).default("change-this-ws-key"),
});

export const env = envSchema.parse(process.env);
