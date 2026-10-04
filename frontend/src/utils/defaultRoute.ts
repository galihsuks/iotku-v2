import type { User } from "../interfaces/auth";

type UserWithRole = User & {
  role_code?: string | null;
  role?: { code?: string | null } | null;
  roles?: Array<{ code?: string | null }>;
};

export const getDefaultAuthenticatedRoute = (user?: User | null) => {
  const typedUser = user as UserWithRole | null | undefined;
  const roleCode = typedUser?.role_code ?? typedUser?.role?.code ?? typedUser?.roles?.[0]?.code;

  if (roleCode === "S") return "/s/menu";
  if (roleCode === "A") return "/a/dashboard";
  return "/u";
};
