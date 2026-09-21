export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  access: {
    menu: ["access", "menu"] as const,
    control: (menuId: string) => ["access", "control", menuId] as const,
  },
  dropdown: {
    role: (keywords = "") => ["dropdown", "role", keywords] as const,
    sensor: (keywords = "") => ["dropdown", "sensor", keywords] as const,
    sensorUnit: (keywords = "") => ["dropdown", "sensor-unit", keywords] as const,
    user: (keywords = "") => ["dropdown", "user", keywords] as const,
  },
  sensor: {
    list: (params?: unknown) => ["sensor", "list", params ?? {}] as const,
    detail: (id: string) => ["sensor", "detail", id] as const,
    readings: (id: string, params?: unknown) => ["sensor", "readings", id, params ?? {}] as const,
  },
  sensorUnit: {
    list: (params?: unknown) => ["sensor-unit", "list", params ?? {}] as const,
  },
  user: {
    list: (params?: unknown) => ["user", "list", params ?? {}] as const,
    detail: (id: string) => ["user", "detail", id] as const,
  },
  role: {
    list: (params?: unknown) => ["role", "list", params ?? {}] as const,
    detail: (id: string) => ["role", "detail", id] as const,
  },
  parameter: {
    list: (params?: unknown) => ["parameter", "list", params ?? {}] as const,
    detail: (id: string) => ["parameter", "detail", id] as const,
  },
  menu: {
    list: ["menu", "list"] as const,
    detail: (id: string) => ["menu", "detail", id] as const,
  },
  menuControl: {
    list: (menuId: string) => ["menu-control", "list", menuId] as const,
  },
  roleMenuControl: {
    list: (roleId: string) => ["role-menu-control", "list", roleId] as const,
  },
  log: {
    list: (params?: unknown) => ["log", "list", params ?? {}] as const,
  },
};
