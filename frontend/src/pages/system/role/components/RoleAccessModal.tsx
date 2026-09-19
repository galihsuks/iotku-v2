import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Save } from "lucide-react";
import { Button, Checkbox, Modal } from "../../../../components/ui";
import { useUpdateRoleMenuControlMutation, useRoleMenuControlListQuery } from "../../../../api/roleMenuControl/roleMenuControlQuery";
import { queryKeys } from "../../../../api/queryKeys";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import { useNotificationStore } from "../../../../store/notifStore";
import type {
  RoleMenuAccessItem,
  RoleMenuControlChangeItem,
  RoleMenuControlItem,
} from "../../../../interfaces/roleMenuControl";
import { cn } from "../../../../utils/cn";

interface RoleAccessTarget {
  id: string;
  name: string;
}

interface RoleAccessModalProps {
  open: boolean;
  target: RoleAccessTarget | null;
  onClose: () => void;
}

const collectMenuNodeIds = (node: RoleMenuControlItem): string[] => {
  return [node.menu_id, ...(node.menu_chilren ?? []).flatMap(collectMenuNodeIds)];
};

export const RoleAccessModal = ({ open, target, onClose }: RoleAccessModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { handleApiFormError } = useApiFormError({ logEvent: "role_access_submit_failed" });
  const { data: roleAccessData, isPending: isRoleAccessPending } = useRoleMenuControlListQuery(target?.id ?? "");
  const { mutate: updateRoleAccessMutation, isPending: isUpdateRoleAccessPending } = useUpdateRoleMenuControlMutation();
  const [changes, setChanges] = useState<RoleMenuControlChangeItem[]>([]);
  const [expandedMenuIds, setExpandedMenuIds] = useState<string[]>([]);

  const accessItems = roleAccessData?.data ?? [];

  const getCheckedValue = (menuId: string, access: RoleMenuAccessItem) => {
    const existingChange = changes.find(
      (item) => item.menu_id === menuId && item.menu_control_id === access.id,
    );
    return existingChange ? existingChange.value : access.checked;
  };

  const toggleExpandedMenu = (menuId: string) => {
    setExpandedMenuIds((prev) =>
      prev.includes(menuId) ? prev.filter((item) => item !== menuId) : [...prev, menuId],
    );
  };

  const onToggleAccess = (menuId: string, access: RoleMenuAccessItem, nextValue: boolean) => {
    setChanges((prev) => {
      const next = [...prev];
      const currentIndex = next.findIndex(
        (item) => item.menu_id === menuId && item.menu_control_id === access.id,
      );

      if (nextValue === access.checked) {
        if (currentIndex >= 0) {
          next.splice(currentIndex, 1);
        }
        return next;
      }

      if (currentIndex >= 0) {
        next[currentIndex] = {
          menu_id: menuId,
          menu_control_id: access.id,
          value: nextValue,
        };
        return next;
      }

      next.push({
        menu_id: menuId,
        menu_control_id: access.id,
        value: nextValue,
      });
      return next;
    });
  };

  const onCloseModal = () => {
    setChanges([]);
    setExpandedMenuIds([]);
    onClose();
  };

  const onSaveChanges = () => {
    if (!target || changes.length === 0) {
      onCloseModal();
      return;
    }

    updateRoleAccessMutation(
      {
        role_id: target.id,
        data: changes,
      },
      {
        onSuccess: (response) => {
          addToast(response.message, "success");
          void queryClient.invalidateQueries({ queryKey: queryKeys.roleMenuControl.list(target.id) });
          void queryClient.invalidateQueries({ queryKey: queryKeys.access.menu });
          setChanges([]);
          onCloseModal();
        },
        onError: (error) => {
          handleApiFormError(error, {
            role_id: target.id,
            changed_items_count: changes.length,
          });
        },
      },
    );
  };

  const pendingChangeCount = useMemo(() => changes.length, [changes]);

  const renderAccessNode = (item: RoleMenuControlItem, depth = 0) => {
    const hasChildren = Boolean(item.menu_chilren && item.menu_chilren.length > 0);
    const isExpanded = expandedMenuIds.includes(item.menu_id);

    return (
      <div key={item.menu_id} className="rounded-2xl border border-dark-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div
              className="flex min-w-0 items-center gap-2"
              style={{ paddingLeft: `${depth * 20}px` }}
            >
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpandedMenu(item.menu_id)}
                  className="rounded-lg p-1 text-dark-500 transition hover:bg-dark-100 hover:text-dark-700"
                >
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", isExpanded ? "rotate-180" : "")}
                  />
                </button>
              ) : (
                <span className="inline-block w-6 text-dark-300">•</span>
              )}
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-dark-900">{item.menu_name}</p>
                <p className="mt-1 text-sm text-dark-500">
                  {item.menu_description || "No description available for this menu."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {item.menu_access.length === 0 ? (
              <span className="rounded-lg bg-light-100 px-3 py-2 text-sm text-dark-500">
                No controls
              </span>
            ) : (
              item.menu_access.map((access) => {
                const checked = getCheckedValue(item.menu_id, access);

                return (
                  <div
                    key={access.id}
                  >
                    <Checkbox
                      checked={checked}
                      onChange={(nextValue) => onToggleAccess(item.menu_id, access, nextValue)}
                      label={access.name}
                      className={cn(
                        "rounded-xl px-3 py-2",
                        checked
                          ? "border-success-300 bg-success-50 text-success-800"
                          : "border-dark-200 bg-white text-dark-600",
                      )}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {hasChildren ? (
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-out",
              isExpanded ? "mt-4 max-h-[1200px] opacity-100" : "mt-0 max-h-0 opacity-0",
            )}
          >
            <div className="space-y-3">
              {item.menu_chilren?.map((child) => renderAccessNode(child, depth + 1))}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onCloseModal}
      title="Set Role Access"
      subtitle={target ? `Manage menu access for ${target.name}.` : "Manage role access."}
      className="max-w-6xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-dark-500">
            {pendingChangeCount > 0
              ? `${pendingChangeCount} change(s) ready to save.`
              : "No unsaved access changes."}
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="light-outline" onClick={onCloseModal}>
              Close
            </Button>
            <Button
              type="button"
              variant="success"
              icon={Save}
              loading={isUpdateRoleAccessPending}
              disabled={pendingChangeCount === 0}
              onClick={onSaveChanges}
            >
              Save Access
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600">Selected Role</p>
          <p className="mt-1 text-lg font-semibold text-dark-900">{target?.name ?? "-"}</p>
        </div>

        {isRoleAccessPending ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 rounded-2xl border border-light-200 bg-light-100" />
            ))}
          </div>
        ) : accessItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-dark-200 bg-light-50 p-6 text-center">
            <p className="text-sm font-medium text-dark-700">No access data available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accessItems.map((item) => renderAccessNode(item))}
          </div>
        )}
      </div>
    </Modal>
  );
};
