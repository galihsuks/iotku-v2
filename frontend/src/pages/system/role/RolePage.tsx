import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, FilterGrid, FormInput, Table } from "../../../components/ui";
import { PageHeader } from "../../../components/layout/PageHeader";
import { useRoleListQuery } from "../../../api/role/roleQuery";
import type { Role } from "../../../interfaces/role";
import { DEFAULT_PAGE_SIZE } from "../../../constants";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { RoleAccessModal } from "./components/RoleAccessModal";
import { RoleDeleteModal } from "./components/RoleDeleteModal";
import { RoleFormModal } from "./components/RoleFormModal";
import InternalServerError from "../../../components/templates/InternalServerError";
import { useHasAccess } from "../../../store/accessControlStore";
import { getRoleTableColumns } from "./components/RoleTableColumns";

interface RoleFilterSchemaType {
  keywords: string;
}

export const RolePage = () => {
  usePageTitle("Role Management");

  const hasAccess = useHasAccess();
  const [page, setPage] = useState(1);
  const { control, watch } = useForm<RoleFilterSchemaType>({
    defaultValues: {
      keywords: "",
    },
  });
  const keywords = watch("keywords");
  const debouncedKeywords = useDebounce(keywords, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeywords]);

  const {
    data: roleListData,
    isPending: isRoleListPending,
    error: roleListError,
  } = useRoleListQuery({
    page,
    page_size: DEFAULT_PAGE_SIZE,
    keywords: debouncedKeywords || undefined,
  });
  const [roleFormMode, setRoleFormMode] = useState<"create" | "edit" | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    code: string;
    name: string;
  } | null>(null);
  const [accessTarget, setAccessTarget] = useState<{ id: string; name: string } | null>(null);

  const roles = roleListData?.data ?? [];
  const pagination = roleListData?.pagination;

  const onOpenCreateRole = () => {
    setSelectedRoleId(null);
    setRoleFormMode("create");
  };

  const onOpenEditRole = (role: Role) => {
    setSelectedRoleId(role.id);
    setRoleFormMode("edit");
  };

  const onCloseRoleForm = () => {
    setSelectedRoleId(null);
    setRoleFormMode(null);
  };

  const columns = getRoleTableColumns({
    hasAccess,
    onOpenAccess: (role) => setAccessTarget({ id: role.id, name: role.name }),
    onEdit: onOpenEditRole,
    onDelete: (role) => setDeleteTarget({ id: role.id, code: role.code, name: role.name }),
  });

  if (roleListError) return <InternalServerError />;

  return (
    <>
      <PageHeader
        title="Role Management"
        subtitle="Create and maintain application roles, then configure what each role can access."
        breadcrumbs={[
          { label: "System", route: undefined },
          { label: "Role", route: undefined },
        ]}
        rightElement={
          hasAccess("C") ? (
            <Button type="button" variant="primary" icon={Plus} onClick={onOpenCreateRole}>
              Add Role
            </Button>
          ) : undefined
        }
      />

      <FilterGrid>
        <FormInput
          control={control}
          name="keywords"
          type="text"
          icon={Search}
          placeholder="Search roles by code, name, or description..."
        />
      </FilterGrid>

      <Table
        columns={columns}
        data={roles}
        loading={isRoleListPending}
        emptyText="No roles available yet."
        pagination={pagination}
        onPageChange={setPage}
      />

      <RoleFormModal
        open={roleFormMode !== null}
        mode={roleFormMode ?? "create"}
        roleId={selectedRoleId}
        onClose={onCloseRoleForm}
      />

      <RoleDeleteModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />

      <RoleAccessModal
        open={accessTarget !== null}
        target={accessTarget}
        onClose={() => setAccessTarget(null)}
      />
    </>
  );
};
