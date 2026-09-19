import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthUser {
  id: string;
  email: string | null;
  role: string | null;
}

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = (password: string, hashedPassword: string) =>
  bcrypt.compare(password, hashedPassword);

export const signAuthToken = (user: AuthUser) => {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    options,
  );
};

export const verifyAuthToken = (token: string): AuthUser => {
  const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
  return {
    id: String(payload.sub ?? ""),
    email: typeof payload.email === "string" ? payload.email : null,
    role: typeof payload.role === "string" ? payload.role : null,
  };
};
