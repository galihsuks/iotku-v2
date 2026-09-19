const normalizeRoute = (route: string) => {
  if (!route) {
    return "/";
  }
  return route.startsWith("/") ? route : `/${route}`;
};

export const toLoginRedirectValue = (route: string) => {
  if (!route) {
    return "/login";
  }
  const normalizedRedirect = normalizeRoute(route);
  return `/login?redirect=${encodeURIComponent(normalizedRedirect)}`;
};
