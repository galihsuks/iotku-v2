const normalizeRoute = (route: string) => {
  if (!route) {
    return "/";
  }
  return route.startsWith("/") ? route : `/${route}`;
};

export const toLoginRedirectValue = (route: string) => {
  if (!route) {
    return "/";
  }
  const normalizedRedirect = normalizeRoute(route);
  return `/?redirect=${encodeURIComponent(normalizedRedirect)}`;
};
