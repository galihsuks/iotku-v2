import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { GuestRoute, PrivateRoute } from "../components/layout/ProtectedRoute";
import NotFound from "../components/templates/NotFound";
import { AppShell } from "./AppShell";
import { LogPage, MenuPage, ParameterPage, RolePage, UserPage } from "./lazyPages";
import { withSuspense } from "./withSuspense";

export const appRouter = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: "/auth",
        element: <GuestRoute />,
        children: [{ path: "login" }, { path: "signup" }],
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            element: <AppLayout />,
            path: "/",
            children: [
              { index: true }, // dashboard page
              // nanti tambah page
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
            ],
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
