import { useEffect, useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAccessControlQuery, useAccessMenuQuery } from "../../api/access/accessQuery";
import { useAuthMeQuery } from "../../api/auth/authQuery";
import { useAuthActions, useAuthStore } from "../../store/authStore";
import { useAccessControlActions } from "../../store/accessControlStore";
import { useHttpErrorActions } from "../../store/httpErrorStore";
import Forbidden from "../templates/Forbidden";
import InternalServerError from "../templates/InternalServerError";
import { findMenuByPath } from "../../utils/accessControl";
import { toLoginRedirectValue } from "../../utils/appRoutes";
import { getDefaultAuthenticatedRoute } from "../../utils/defaultRoute";

export const PrivateRoute = () => {
  const location = useLocation();
  const storedUser = useAuthStore((state) => state.user);
  const isResolved = useAuthStore((state) => state.isResolved);
  const { syncUser } = useAuthActions();
  const { clearAccessContext, setAccessContext } = useAccessControlActions();
  const { clearError } = useHttpErrorActions();
  const { data: meData, isPending: isMePending, error: meError } = useAuthMeQuery();
  const user = meData?.data ?? storedUser;
  const isAuth = Boolean(user);
  const {
    data: accessMenuData,
    isPending: isAccessMenuPending,
    error: accessMenuError,
  } = useAccessMenuQuery(isAuth);
  const matchedMenu = useMemo(
    () => findMenuByPath(accessMenuData?.data ?? [], location.pathname),
    [accessMenuData?.data, location.pathname],
  );
  const matchedMenuId = matchedMenu?.id ?? "";
  const shouldFetchAccessControl = isAuth && Boolean(matchedMenuId);
  const {
    data: accessControlData,
    isLoading: isAccessControlLoading,
    error: accessControlError,
  } = useAccessControlQuery(matchedMenuId, shouldFetchAccessControl);
  const isAccessMenuLoading = isAuth && isAccessMenuPending;
  const isAccessGuardLoading = isAccessMenuLoading || isAccessControlLoading;

  useEffect(() => {
    clearError();
  }, [clearError, location.pathname]);

  useEffect(() => {
    if (meData?.data) {
      syncUser(meData.data);
      return;
    }

    if (!isMePending && !meError && isResolved && !storedUser) {
      syncUser(null);
    }
  }, [isMePending, isResolved, meData?.data, meError, storedUser, syncUser]);

  useEffect(() => {
    if (!isAuth || !matchedMenuId) {
      clearAccessContext();
      return;
    }

    if (isAccessControlLoading) {
      return;
    }

    setAccessContext(matchedMenuId, accessControlData?.data ?? []);
  }, [
    accessControlData?.data,
    clearAccessContext,
    isAccessControlLoading,
    isAuth,
    matchedMenuId,
    setAccessContext,
  ]);

  useEffect(() => {
    return () => {
      clearAccessContext();
    };
  }, [clearAccessContext]);

  if (isMePending && !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 px-4">
        <div className="rounded-3xl border border-primary-100 bg-white px-6 py-5 text-center shadow-[0_18px_50px_-32px_rgba(30,41,59,0.28)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">
            Authenticating
          </p>
          <p className="mt-2 text-sm text-slate-500">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to={toLoginRedirectValue(`${location.pathname}${location.search}`)} replace />;
  }

  if (meError && !user) {
    return null;
  }

  if (accessMenuError || accessControlError) {
    return <InternalServerError />;
  }

  if (isAccessGuardLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 px-4">
        <div className="rounded-3xl border border-primary-100 bg-white px-6 py-5 text-center shadow-[0_18px_50px_-32px_rgba(30,41,59,0.28)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">
            Loading Access
          </p>
          <p className="mt-2 text-sm text-slate-500">Checking your permissions...</p>
        </div>
      </div>
    );
  }

  if (
    !isAccessMenuLoading &&
    !isAccessControlLoading &&
    (!matchedMenuId || !(accessControlData?.data ?? []).includes("R"))
  ) {
    return <Forbidden />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const storedUser = useAuthStore((state) => state.user);
  const { syncUser } = useAuthActions();
  const { data: meData, isPending: isMePending, error: meError } = useAuthMeQuery();
  const user = meData?.data ?? storedUser;
  const isAuth = Boolean(user);

  useEffect(() => {
    if (meData?.data) {
      syncUser(meData.data);
      return;
    }

    if (!isMePending && meError && !storedUser) {
      syncUser(null);
    }
  }, [isMePending, meData?.data, meError, storedUser, syncUser]);

  if (isMePending && !storedUser) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 px-4">
        <div className="rounded-3xl border border-primary-100 bg-white px-6 py-5 text-center shadow-[0_18px_50px_-32px_rgba(30,41,59,0.28)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">
            Authenticating
          </p>
          <p className="mt-2 text-sm text-slate-500">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  if (isAuth) {
    return <Navigate to={getDefaultAuthenticatedRoute(user)} replace />;
  }

  return <Outlet />;
};
