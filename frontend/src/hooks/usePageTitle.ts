import { useEffect } from "react";
import { APP_NAME } from "../constants";

type UsePageTitleOptions = {
  withAppName?: boolean;
};

export const buildPageTitle = (
  title?: string | null,
  options?: UsePageTitleOptions,
) => {
  const withAppName = options?.withAppName ?? true;
  const trimmedTitle = title?.trim();

  if (!trimmedTitle) {
    return APP_NAME;
  }

  if (!withAppName) {
    return trimmedTitle;
  }

  return `${trimmedTitle} | ${APP_NAME}`;
};

export const usePageTitle = (
  title?: string | null,
  options?: UsePageTitleOptions,
) => {
  useEffect(() => {
    document.title = buildPageTitle(title, options);
  }, [options, title]);
};
