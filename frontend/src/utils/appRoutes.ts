const normalizeRoute = (route: string) => {
  if (!route) {
    return "/";
  }
  return route.startsWith("/") ? route : `/${route}`;
};

export const toLoginRedirectValue = (route: string) => {
  if (!route) {
    return "/auth/login";
  }
  const normalizedRedirect = normalizeRoute(route);
  return `/auth/login?redirect=${encodeURIComponent(normalizedRedirect)}`;
};
