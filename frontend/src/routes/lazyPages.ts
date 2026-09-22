import { lazy } from "react";

export const LoginPage = lazy(() =>
  import("../pages/auth/LoginPage").then((module) => ({ default: module.LoginPage })),
);

export const SignupPage = lazy(() =>
  import("../pages/auth/SignupPage").then((module) => ({ default: module.SignupPage })),
);

export const DashboardPage = lazy(() =>
  import("../pages/main/dashboard/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);

export const SensorAddPage = lazy(() =>
  import("../pages/main/add/AddPage").then((module) => ({ default: module.AddPage })),
);

export const SensorDetailPage = lazy(() =>
  import("../pages/main/detail/DetailPage").then((module) => ({
    default: module.DetailPage,
  })),
);

export const SensorEditPage = lazy(() =>
  import("../pages/main/edit/EditPage").then((module) => ({ default: module.EditPage })),
);

export const AdminDashboardPage = lazy(() =>
  import("../pages/admin/AdminDashboardPage").then((module) => ({
    default: module.AdminDashboardPage,
  })),
);

export const AdminSensorPage = lazy(() =>
  import("../pages/admin/AdminSensorPage").then((module) => ({ default: module.AdminSensorPage })),
);

export const AdminSensorUnitPage = lazy(() =>
  import("../pages/admin/AdminSensorUnitPage").then((module) => ({
    default: module.AdminSensorUnitPage,
  })),
);

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

export const ProfilePage = lazy(() =>
  import("../pages/system/profile/ProfilePage").then((module) => ({ default: module.ProfilePage })),
);

export const WebSocketLogPage = lazy(() =>
  import("../pages/system/websocket-log/WebSocketLogPage").then((module) => ({
    default: module.WebSocketLogPage,
  })),
);
