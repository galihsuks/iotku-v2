import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button, FormInput, FormRadio, Modal } from "../../../../components/ui";
import { useCreateMenuMutation, useMenuDetailQuery, useUpdateMenuMutation } from "../../../../api/menu/menuQuery";
import { queryKeys } from "../../../../api/queryKeys";
import { menuIconOptions } from "../../../../constants/menuIcons";
import { useApiFormError } from "../../../../hooks/useApiFormError";
import { useNotificationStore } from "../../../../store/notifStore";
import type { DropdownOption } from "../../../../interfaces/dropdown";
import type { MenuTreeGroup, MenuTreeNode } from "../../../../interfaces/menu";
import { type MenuFormSchemaType, menuFormSchema } from "../schema/MenuFormSchema";

interface MenuFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  menuId?: string | null;
  menuGroups: MenuTreeGroup[];
  onClose: () => void;
}

const getDescendantIds = (node: MenuTreeNode): string[] => {
  return [node.id, ...(node.chilren ?? []).flatMap(getDescendantIds)];
};

const getExcludedParentIds = (groups: MenuTreeGroup[], menuId?: string | null) => {
  if (!menuId) return new Set<string>();

  for (const group of groups) {
    for (const item of group.group_children) {
      const stack = [item];
      while (stack.length > 0) {
        const current = stack.pop();
        if (!current) continue;
        if (current.id === menuId) {
          return new Set(getDescendantIds(current));
        }
        stack.push(...(current.chilren ?? []));
      }
    }
  }

  return new Set<string>([menuId]);
};

const flattenMenuOptions = (
  items: MenuTreeNode[],
  excludedIds: Set<string>,
  depth = 0,
): DropdownOption[] => {
  return items.flatMap((item) => {
    if (excludedIds.has(item.id)) {
      return [];
    }

    const prefix = depth > 0 ? `${"  ".repeat(depth)}- ` : "";
    return [
      {
        value: item.id,
        label: `${prefix}${item.name}`,
      },
      ...flattenMenuOptions(item.chilren ?? [], excludedIds, depth + 1),
    ];
  });
};

export const MenuFormModal = ({ open, mode, menuId, menuGroups, onClose }: MenuFormModalProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { mutate: createMenuMutation, isPending: isCreateMenuPending } = useCreateMenuMutation();
  const { mutate: updateMenuMutation, isPending: isUpdateMenuPending } = useUpdateMenuMutation();
  const { handleApiFormError } = useApiFormError({ logEvent: "menu_form_submit_failed" });
  const { data: menuDetailData, isPending: isMenuDetailPending } = useMenuDetailQuery(mode === "edit" ? (menuId ?? "") : "");

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<MenuFormSchemaType>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      parent_menu_id: "",
      name: "",
      description: "",
      url: "",
      group: "main",
      icon: "",
      display: "1",
      sort: "1",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      reset({
        parent_menu_id: "",
        name: "",
        description: "",
        url: "",
        group: "main",
        icon: "",
        display: "1",
        sort: "1",
      });
      return;
    }

    if (!menuDetailData?.data) return;

    reset({
      parent_menu_id: menuDetailData.data.parent_menu_id ?? "",
      name: menuDetailData.data.name,
      description: menuDetailData.data.description ?? "",
      url: menuDetailData.data.url ?? "",
      group: menuDetailData.data.group,
      icon: menuDetailData.data.icon ?? "",
      display: String(menuDetailData.data.display ? "1" : "0") as "1" | "0",
      sort: String(menuDetailData.data.sort ?? 0),
    });
  }, [menuDetailData?.data, mode, open, reset]);

  const excludedParentIds = useMemo(
    () => getExcludedParentIds(menuGroups, mode === "edit" ? menuId : null),
    [menuGroups, menuId, mode],
  );

  const parentMenuOptions = useMemo(() => {
    return [
      { value: "", label: "No parent menu" },
      ...menuGroups.flatMap((group) => flattenMenuOptions(group.group_children, excludedParentIds)),
    ];
  }, [excludedParentIds, menuGroups]);

  const isSubmitPending = isCreateMenuPending || isUpdateMenuPending;

  const onSubmit = (values: MenuFormSchemaType) => {
    const payload = {
      parent_menu_id: values.parent_menu_id || null,
      name: values.name,
      description: values.description || null,
      url: values.url || null,
      group: values.group,
      icon: values.icon || null,
      display: values.display,
      sort: Number(values.sort),
    };

    if (mode === "create") {
      createMenuMutation(payload, {
        onSuccess: (response) => {
          addToast(response.message, "success");
          void queryClient.invalidateQueries({ queryKey: queryKeys.menu.list });
          void queryClient.invalidateQueries({ queryKey: queryKeys.access.menu });
          onClose();
        },
        onError: (error) => {
          handleApiFormError(error, {
            form_mode: mode,
            menu_name: values.name,
          });
        },
      });
      return;
    }

    if (!menuId) return;

    updateMenuMutation(
      { id: menuId, payload },
      {
        onSuccess: (response) => {
          addToast(response.message, "success");
          void queryClient.invalidateQueries({ queryKey: queryKeys.menu.list });
          void queryClient.invalidateQueries({ queryKey: queryKeys.menu.detail(menuId) });
          void queryClient.invalidateQueries({ queryKey: queryKeys.access.menu });
          onClose();
        },
        onError: (error) => {
          handleApiFormError(error, {
            form_mode: mode,
            menu_id: menuId,
            menu_name: values.name,
          });
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Create menu" : "Edit menu"}
      subtitle={
        mode === "create"
          ? "Add a new menu item and configure how it appears in the application."
          : "Update menu information and hierarchy settings."
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="light-outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" buttonType="submit" loading={isSubmitPending} onClick={handleSubmit(onSubmit)}>
            {mode === "create" ? "Save Menu" : "Update Menu"}
          </Button>
        </div>
      }
    >
      {mode === "edit" && isMenuDetailPending ? (
        <div className="space-y-3">
          <div className="h-11 rounded-xl bg-light-100" />
          <div className="h-11 rounded-xl bg-light-100" />
          <div className="h-11 rounded-xl bg-light-100" />
        </div>
      ) : (
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            control={control}
            name="parent_menu_id"
            type="dropdown"
            label="Parent Menu"
            placeholder="Select parent menu"
            dropdownOptions={parentMenuOptions}
          />
          <FormRadio
            control={control}
            name="display"
            label="Display"
            options={[
              { value: "1", label: "Show menu" },
              { value: "0", label: "Hide menu" },
            ]}
          />
          <FormInput control={control} name="name" label="Menu Name" placeholder="Example: Dashboard" />
          <FormInput
            control={control}
            name="group"
            type="dropdown"
            label="Group"
            placeholder="Select menu group"
            dropdownOptions={[
              { value: "main", label: "Main" },
              { value: "system", label: "System" },
            ]}
          />
          <FormInput
            control={control}
            name="description"
            label="Description"
            placeholder="Short description for this menu"
          />
          <FormInput control={control} name="sort" type="number" label="Sort Order" placeholder="1" />
          <FormInput control={control} name="url" label="URL" placeholder="/dashboard" className="md:col-span-2" />
          <FormInput
            control={control}
            name="icon"
            type="dropdown"
            label="Menu Icon"
            placeholder="Select menu icon"
            dropdownOptions={[{ value: "", label: "No icon" }, ...menuIconOptions]}
            className="md:col-span-2"
          />
        </form>
      )}
    </Modal>
  );
};
