import { Circle, Eye, EyeOff, Pencil, Settings2, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui";
import { resolveMenuIcon } from "../../../../constants/menuIcons";
import type { MenuTreeNode } from "../../../../interfaces/menu";

export interface MenuListItem extends MenuTreeNode {
  depth: number;
}

interface MenuRowProps {
  menu: MenuListItem;
  index: number;
  total: number;
  onEdit: (menu: MenuTreeNode) => void;
  onDelete: (menu: { id: string; name: string }) => void;
  onManageControls: (menu: { id: string; name: string }) => void;
  canManageControls: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export const MenuRow = ({
  menu,
  index,
  total,
  onEdit,
  onDelete,
  onManageControls,
  canManageControls,
  canEdit,
  canDelete,
}: MenuRowProps) => {
  const MenuIcon = resolveMenuIcon(menu.icon, Circle);

  return (
    <div
      className="group rounded-2xl border border-dark-100 bg-white/90 px-4 py-3 shadow-sm transition hover:border-primary-200 hover:shadow-md"
      style={{ marginLeft: `${menu.depth * 40}px` }}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {menu.depth === 0 ? (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
              <MenuIcon className="h-5 w-5" />
            </div>
          ) : null}

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex items-center gap-2">
                {menu.depth > 0 ? <span className="text-dark-300">|-</span> : null}
                <p className="truncate text-base font-semibold text-dark-900">{menu.name}</p>
              </div>
              {String(menu.display) === "1" ? (
                <Eye className="h-4 w-4 shrink-0 text-success-600" />
              ) : (
                <EyeOff className="h-4 w-4 shrink-0 text-danger-600" />
              )}
            </div>

            <p className="mt-1 text-sm text-dark-500">
              {menu.description || "No description provided for this menu."}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-dark-400">
              URL: {menu.url || "-"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="mr-1 hidden text-xs font-semibold uppercase tracking-[0.16em] text-dark-400 lg:block">
            {menu.depth === 0 ? `Parent order ${index + 1}/${total}` : `Child level ${menu.depth}`}
          </span>
          {canManageControls ? (
            <Button
              type="button"
              variant="success"
              icon={Settings2}
              className="px-3"
              onClick={() => onManageControls({ id: menu.id, name: menu.name })}
            />
          ) : null}
          {canEdit ? (
            <Button
              type="button"
              variant="warning"
              icon={Pencil}
              className="px-3"
              onClick={() => onEdit(menu)}
            />
          ) : null}
          {canDelete ? (
            <Button
              type="button"
              variant="danger"
              icon={Trash2}
              className="px-3"
              onClick={() => onDelete({ id: menu.id, name: menu.name })}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

