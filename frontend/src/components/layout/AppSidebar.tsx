import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Circle,
  ChevronDown,
  ChevronsLeft,
  LogOut,
  X,
  type LucideIcon,
  EllipsisVertical,
} from "lucide-react";
import { useAccessMenuQuery } from "../../api/access/accessQuery";
import { useAuthLogoutMutation } from "../../api/auth/authQuery";
import { AppLogo } from "../shared/AppLogo";
import { resolveMenuIcon } from "../../constants/menuIcons";
import { queryClient } from "../../lib/queryClient";
import { useNotificationStore } from "../../store/notifStore";
import { useAuthActions, useUser } from "../../store/authStore";
import { useCollapseDesktopSidebar, useLayoutActions } from "../../store/layoutStore";
import { cn } from "../../utils/cn";
import type { MenuGroup, MenuTreeNode } from "../../interfaces/menu";

interface NavItem {
  id: string;
  name: string;
  description: string | null;
  group: "main" | "system";
  display: string;
  sort: string;
  label: string;
  icon: LucideIcon;
  path?: string | null;
  children?: NavItem[];
}

interface NavGroup {
  group: MenuGroup;
  items: NavItem[];
}

interface AppSidebarProps {
  isCustomer?: boolean;
}

export const AppSidebar = ({ isCustomer }: AppSidebarProps) => {
  const user = useUser();
  const { logout } = useAuthActions();
  const { addToast } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    data: accessMenuData,
    isPending: isAccessMenuPending,
    error: accessMenuError,
  } = useAccessMenuQuery();
  const [openMobileSidebar, setOpenMobileSidebar] = useState(false);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const { mutate: logoutMutation, isPending: isLogoutPending } = useAuthLogoutMutation();
  const collapseDesktopSidebar = useCollapseDesktopSidebar();
  const { setCollapseDesktopSidebar } = useLayoutActions();

  const mapMenuNode = (node: MenuTreeNode): NavItem => {
    const rawChildren = (node.chilren ?? []) as MenuTreeNode[];
    return {
      ...node,
      label: node.name,
      path: node.url,
      icon: resolveMenuIcon(node.icon, Circle),
      children: rawChildren.map(mapMenuNode),
    };
  };

  const navGroups = useMemo<NavGroup[]>(() => {
    const fromApi = accessMenuData?.data ?? [];

    return fromApi
      .map((group) => ({
        group: group.group,
        items: group.group_children.map(mapMenuNode),
      }))
      .filter((group) => group.items.length > 0);
  }, [accessMenuData]);

  const onLogout = () => {
    logoutMutation(undefined, {
      onSuccess: (response) => {
        if (response.message) {
          addToast(response.message, "success");
        }
      },
      onError: (error) => {
        addToast(error.message, "error");
      },
      onSettled: () => {
        queryClient.clear();
        logout();
        window.location.replace("/auth/login");
      },
    });
  };

  const onClickNav = (item: NavItem, depth: number) => {
    const hasChildren = Boolean(item.children && item.children.length > 0);

    if (hasChildren) {
      if (collapseDesktopSidebar) {
        setCollapseDesktopSidebar(false);
        setExpandedMenuId(item.id);
        return;
      }
      setExpandedMenuId((prev) => (prev === item.id ? null : item.id));
      return;
    }

    if (depth === 0) {
      setExpandedMenuId(null);
    }

    if (!item.path) {
      addToast("This menu will be available soon.", "info");
      return;
    }
    navigate(item.path);
    setOpenMobileSidebar(false);
  };

  const isActiveItem = (item: NavItem) => {
    if (!item.path) return false;
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  const renderNavItems = (items: NavItem[], compact: boolean, depth = 0) => {
    if (items.length === 0) return null;
    return items.map((item) => {
      const Icon = item.icon;
      const active = isActiveItem(item);

      if (compact && depth > 0) {
        return null;
      }

      return (
        <div key={`${depth}-${item.id}`}>
          {(() => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isExpanded = expandedMenuId === item.id;
            return (
              <div
                onClick={() => onClickNav(item, depth)}
                className={cn(
                  "select-none cursor-default group flex w-full items-center px-3 py-2.5 text-left text-sm transition-all duration-200 rounded-xl",
                  active
                    ? "bg-primary-600 text-white"
                    : "text-dark-600 hover:bg-primary-50 hover:text-primary-700",
                  compact ? "justify-center gap-0" : "gap-3",
                  depth > 0 && !compact ? "ml-3 max-w-[calc(100%-var(--spacing)*3)] pl-4" : "",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span
                  className={cn(
                    "truncate transition-all duration-200",
                    compact ? "max-w-0 opacity-0" : "max-w-48 opacity-100",
                  )}
                >
                  {item.label}
                </span>
                {hasChildren && !compact ? (
                  <ChevronDown
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
                      isExpanded ? "rotate-180" : "rotate-0",
                    )}
                  />
                ) : null}
              </div>
            );
          })()}

          {!compact && item.children && item.children.length > 0 ? (
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-out ml-4 border-l border-dark-200",
                expandedMenuId === item.id
                  ? "mt-1 max-h-[480px] opacity-100"
                  : "mt-0 max-h-0 opacity-0",
              )}
            >
              <div className="space-y-1">{renderNavItems(item.children, compact, depth + 1)}</div>
            </div>
          ) : null}
        </div>
      );
    });
  };

  const renderSidebarContent = (compact: boolean) => (
    <>
      <div className="mb-6 flex items-center transition-all duration-300 justify-center">
        <div
          className={cn(
            "flex-1 flex items-center overflow-hidden transition-all duration-300",
            collapseDesktopSidebar ? "gap-0" : "gap-3",
          )}
        >
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
            <AppLogo variant="icon" className="h-8 w-8" />
          </div>
          <div
            className={cn(
              "min-w-0 overflow-hidden transition-all duration-300",
              compact ? "max-w-0 opacity-0" : "max-w-56 opacity-100",
            )}
          >
            <div className="min-w-0">
              <p className="truncate text-xs tracking-[0.2em] text-dark-500">v2.0</p>
              <AppLogo variant="text" className="truncate" />
            </div>
          </div>
        </div>

        {!compact && (
          <button
            type="button"
            onClick={() => setCollapseDesktopSidebar(true)}
            className="hidden rounded-lg p-2 text-dark-500 transition hover:bg-dark-100 hover:text-dark-700 md:inline-flex"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto hide-scrollbar">
        <nav className="space-y-4">
          {accessMenuError ? (
            <div className="rounded-2xl border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
              Menu failed to load.
            </div>
          ) : isAccessMenuPending ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className={cn("h-9 rounded-xl bg-light-200", compact ? "mx-auto w-9" : "w-full")}
                />
              ))}
            </div>
          ) : navGroups.length === 0 ? (
            <div className="rounded-2xl border border-dark-200 bg-light-50 p-3 text-sm text-dark-500">
              No accessible menu available.
            </div>
          ) : (
            navGroups.map((group) => (
              <div key={group.group}>
                {!compact ? (
                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.14em] text-dark-400">
                    {group.group === "main" ? "Main" : "System"}
                  </p>
                ) : (
                  <hr className="mb-4 border-dark-200" />
                )}
                <div className="space-y-1">{renderNavItems(group.items, compact)}</div>
              </div>
            ))
          )}
        </nav>
      </div>

      <div className="pt-6">
        <div
          className={cn(
            "mb-3 overflow-hidden rounded-xl border border-dark-200 bg-light-50 p-3 transition-all duration-300",
            compact ? "max-h-0 border-transparent p-0 opacity-0" : "max-h-20 opacity-100",
          )}
        >
          <p className="text-xs text-dark-500">Signed in as</p>
          <p className="truncate text-sm font-semibold text-dark-800">{user?.full_name}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={isLogoutPending}
          className={cn(
            "flex w-full items-center rounded-xl bg-danger-50 px-3 py-2.5 text-sm font-semibold text-danger-500 transition hover:bg-danger-100 disabled:cursor-not-allowed disabled:opacity-70",
            compact ? "justify-center gap-0" : "gap-3",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap transition-all duration-200",
              compact ? "max-w-0 opacity-0" : "max-w-28 opacity-100",
            )}
          >
            {isLogoutPending ? "Signing out..." : "Sign out"}
          </span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside
        className={cn(
          "sticky hidden md:flex flex-col rounded-3xl border border-primary-100 bg-white p-4 shadow-[0_20px_50px_-35px_rgba(30,41,59,0.32)] transition-all duration-300",
          isCustomer
            ? "top-[calc(var(--spacing)*6+65px)] h-[calc(100svh-var(--spacing)*12-65px)]"
            : "top-[calc(var(--spacing)*6)] h-[calc(100svh-var(--spacing)*12)]",
          collapseDesktopSidebar ? "md:w-[80px]" : "md:w-[280px]",
        )}
      >
        {renderSidebarContent(collapseDesktopSidebar)}
      </aside>

      <div className="fixed left-0 px-4 top-0 z-30 md:hidden h-[65px] w-full bg-white/80 backdrop-blur-xl">
        <div className="relative h-full w-full relative flex items-center justify-center">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-glow">
              <AppLogo variant="icon" className="h-7 w-auto" />
            </div>
            <div>
              <p className="text-lg font-semibold text-primary-700">Iotku</p>
            </div>
          </a>
          <div
            onClick={() => setOpenMobileSidebar(true)}
            className="right-0 absolute items-center justify-center rounded-2xl text-dark-800"
          >
            <EllipsisVertical className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-dark-900/45 backdrop-blur-[1px] transition-opacity duration-300 md:hidden",
          openMobileSidebar ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <aside
          className={cn(
            "h-full w-[85%] max-w-xs border-r border-primary-100 bg-white p-4 shadow-2xl transition-transform duration-300",
            openMobileSidebar ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => setOpenMobileSidebar(false)}
              className="rounded-lg p-2 text-dark-500 transition hover:bg-dark-100 hover:text-dark-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex h-[calc(100%-2.5rem)] flex-col">{renderSidebarContent(false)}</div>
        </aside>
      </div>
    </>
  );
};
