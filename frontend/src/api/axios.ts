import axios from "axios";
import { queryClient } from "../lib/queryClient";
import { useAuthStore } from "../store/authStore";
import { useHttpErrorStore } from "../store/httpErrorStore";
import { toLoginRedirectValue } from "../utils/appRoutes";
import envVar from "../utils/envReader";
import { generateRequestId } from "../utils/requestId";

type RequestMeta = {
  requestId: string;
  startedAt: number;
};

const api = axios.create({
  baseURL: envVar.BASE_URL_API,
  withCredentials: true,
});

const trimApiTrailingSlash = (url?: string) => {
  if (!url) {
    return url;
  }

  const [path, query = ""] = url.split("?");
  const normalizedPath = path.length > 1 ? path.replace(/\/+$/, "") : path;

  return query ? `${normalizedPath}?${query}` : normalizedPath;
};

api.interceptors.request.use((config) => {
  const requestId = generateRequestId();
  (config as typeof config & { metadata?: RequestMeta }).metadata = {
    requestId,
    startedAt: Date.now(),
  };

  config.url = trimApiTrailingSlash(config.url);
  config.headers["X-Request-Id"] = requestId;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error?.response) {
      useHttpErrorStore.getState().actions.setError("network_error");
      return Promise.reject(error);
    }

    const statusCode = Number(error.response.status ?? 0);
    if (statusCode === 403) {
      useHttpErrorStore.getState().actions.setError("forbidden", statusCode);
    } else if (statusCode === 404) {
      useHttpErrorStore.getState().actions.setError("not_found", statusCode);
    } else if (statusCode >= 500) {
      useHttpErrorStore.getState().actions.setError("internal_server_error", statusCode);
    }

    if (error.response && error.response.status === 401) {
      queryClient.clear();
      const { logout } = useAuthStore.getState().actions;
      logout();
      const redirect = toLoginRedirectValue(`${window.location.pathname}${window.location.search}`);
      window.location.replace(redirect);
    }

    return Promise.reject(error);
  },
);

export default api;
