import { Suspense, type ReactNode } from "react";
import { RouteLoader } from "./RouteLoader";

export const withSuspense = (element: ReactNode) => {
  return <Suspense fallback={<RouteLoader />}>{element}</Suspense>;
};
