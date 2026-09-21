import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { GuestRoute, PrivateRoute } from "../components/layout/ProtectedRoute";
import NotFound from "../components/templates/NotFound";
import { AppShell } from "./AppShell";
import {
  AdminDashboardPage,
  AdminSensorPage,
  AdminSensorUnitPage,
  DashboardPage,
  LoginPage,
  LogPage,
  MenuPage,
  ParameterPage,
  ProfilePage,
  RolePage,
  SensorAddPage,
  SensorDetailPage,
  SensorEditPage,
  UserPage,
  WebSocketLogPage,
} from "./lazyPages";
import { withSuspense } from "./withSuspense";

export const appRouter = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: "/auth",
        element: <GuestRoute />,
        children: [{ path: "login", element: withSuspense(<LoginPage />) }, { path: "signup" }],
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            element: <AppLayout />,
            path: "/",
            children: [
              { index: true, element: withSuspense(<DashboardPage />) },
              { path: "add", element: withSuspense(<SensorAddPage />) },
              { path: "edit/:id", element: withSuspense(<SensorEditPage />) },
              { path: "detail/:id", element: withSuspense(<SensorDetailPage />) },
            ],
          },
          {
            element: <AppLayout />,
            path: "/system",
            children: [
              { path: "menu", element: withSuspense(<MenuPage />) },
              { path: "role", element: withSuspense(<RolePage />) },
              { path: "user", element: withSuspense(<UserPage />) },
              { path: "parameter", element: withSuspense(<ParameterPage />) },
              { path: "log", element: withSuspense(<LogPage />) },
              { path: "profile", element: withSuspense(<ProfilePage />) },
              { path: "websocket-log", element: withSuspense(<WebSocketLogPage />) },
            ],
          },
          {
            element: <AppLayout />,
            path: "/admin",
            children: [
              { path: "dashboard", element: withSuspense(<AdminDashboardPage />) },
              { path: "sensor", element: withSuspense(<AdminSensorPage />) },
              { path: "sensor-unit", element: withSuspense(<AdminSensorUnitPage />) },
            ],
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
