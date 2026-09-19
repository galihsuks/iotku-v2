import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Button } from "../../../components/ui";
import { PageHeader } from "../../../components/layout/PageHeader";
import { useMenuListQuery } from "../../../api/menu/menuQuery";
import type { MenuTreeGroup, MenuTreeNode } from "../../../interfaces/menu";
import { MenuControlModal } from "./components/MenuControlModal";
import { MenuDeleteModal } from "./components/MenuDeleteModal";
import { MenuFormModal } from "./components/MenuFormModal";
import { MenuRow, type MenuListItem } from "./components/MenuRow";
import InternalServerError from "../../../components/templates/InternalServerError";
import { useHasAccess } from "../../../store/accessControlStore";
import { usePageTitle } from "../../../hooks/usePageTitle";

const flattenMenuItems = (items: MenuTreeNode[], depth = 0): MenuListItem[] => {
  return items.flatMap((item) => [
    { ...item, depth },
    ...flattenMenuItems(item.chilren ?? [], depth + 1),
  ]);
};

const getGroupLabel = (group: MenuTreeGroup["group"]) => {
  return group === "main" ? "Main Menus" : "System Menus";
};

export const MenuPage = () => {
  usePageTitle("Menu Management");

  const hasAccess = useHasAccess();
  const {
    data: menuListData,
    isPending: isMenuListPending,
    error: menuListError,
  } = useMenuListQuery();
  const [menuFormMode, setMenuFormMode] = useState<"create" | "edit" | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [menuControlTarget, setMenuControlTarget] = useState<{ id: string; name: string } | null>(
    null,
  );

  const menuGroups = useMemo(() => menuListData?.data ?? [], [menuListData?.data]);

  const onOpenCreateMenu = () => {
    setSelectedMenuId(null);
    setMenuFormMode("create");
  };

  const onOpenEditMenu = (menu: MenuTreeNode) => {
    setSelectedMenuId(menu.id);
    setMenuFormMode("edit");
  };

  const onCloseMenuForm = () => {
    setMenuFormMode(null);
    setSelectedMenuId(null);
  };

  if (menuListError) return <InternalServerError />;

  return (
    <>
      <PageHeader
        title="Menu Management"
        subtitle="Organize application menus, configure hierarchy, and manage menu controls from one place."
        breadcrumbs={[
          { label: "System", route: undefined },
          { label: "Menu", route: undefined },
        ]}
        rightElement={
          hasAccess("C") ? (
            <Button type="button" variant="primary" icon={Plus} onClick={onOpenCreateMenu}>
              Add Menu
            </Button>
          ) : undefined
        }
      />

      {isMenuListPending ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-24 rounded-2xl border border-light-200 bg-light-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {menuGroups.map((group) => {
            const items = flattenMenuItems(group.group_children);

            return (
              <div
                key={group.group}
                className="rounded-[24px] border border-dark-100 bg-white/80 p-4"
              >
                <div className="mb-4 flex items-center justify-between border-b border-dark-100 pb-3">
                  <div>
                    <Badge variant={group.group === "main" ? "primary-outline" : "dark-outline"}>
                      {group.group}
                    </Badge>
                    <h3 className="mt-1 text-lg font-semibold text-dark-900">
                      {getGroupLabel(group.group)}
                    </h3>
                  </div>
                  <span className="rounded-xl bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                    {items.length} items
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-dark-200 bg-light-50 p-6 text-center">
                    <p className="text-sm font-medium text-dark-700">No menus in this group yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((menu, index) => (
                      <MenuRow
                        key={menu.id}
                        menu={menu}
                        index={index}
                        total={items.length}
                        onEdit={onOpenEditMenu}
                        onDelete={setDeleteTarget}
                        onManageControls={setMenuControlTarget}
                        canManageControls={hasAccess("U")}
                        canEdit={hasAccess("U")}
                        canDelete={hasAccess("D")}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <MenuFormModal
        open={menuFormMode !== null}
        mode={menuFormMode ?? "create"}
        menuId={selectedMenuId}
        menuGroups={menuGroups}
        onClose={onCloseMenuForm}
      />

      <MenuDeleteModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />

      <MenuControlModal
        open={menuControlTarget !== null}
        menuId={menuControlTarget?.id ?? null}
        menuName={menuControlTarget?.name ?? null}
        onClose={() => setMenuControlTarget(null)}
      />
    </>
  );
};
