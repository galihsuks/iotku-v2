import { lazy } from "react";

export const MenuPage = lazy(() =>
  import("../pages/system/menu/MenuPage").then((module) => ({ default: module.MenuPage })),
);

export const RolePage = lazy(() =>
  import("../pages/system/role/RolePage").then((module) => ({ default: module.RolePage })),
);

export const UserPage = lazy(() =>
  import("../pages/system/user/UserPage").then((module) => ({ default: module.UserPage })),
);

export const ParameterPage = lazy(() =>
  import("../pages/system/parameter/ParameterPage").then((module) => ({
    default: module.ParameterPage,
  })),
);

export const LogPage = lazy(() =>
  import("../pages/system/log/LogPage").then((module) => ({ default: module.LogPage })),
);
