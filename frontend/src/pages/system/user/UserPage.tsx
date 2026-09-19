import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, FilterGrid, FormInput, Table } from "../../../components/ui";
import { PageHeader } from "../../../components/layout/PageHeader";
import { useUserListQuery } from "../../../api/user/userQuery";
import { dropdownApi } from "../../../api/dropdown/dropdownApi";
import { DEFAULT_PAGE_SIZE } from "../../../constants";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePageTitle } from "../../../hooks/usePageTitle";
import type { DropdownOption } from "../../../interfaces/dropdown";
import type { UserListItem } from "../../../interfaces/user";
import { UserDeleteModal } from "./components/UserDeleteModal";
import { UserFormModal } from "./components/UserFormModal";
import { UserPasswordModal } from "./components/UserPasswordModal";
import InternalServerError from "../../../components/templates/InternalServerError";
import { useHasAccess } from "../../../store/accessControlStore";
import { getUserTableColumns } from "./components/UserTableColumns";

interface UserFilterSchemaType {
  keywords: string;
  role_id: string;
}

const ALL_ROLE_OPTION: DropdownOption = {
  value: "",
  label: "All roles",
};

export const UserPage = () => {
  usePageTitle("User Account Management");

  const hasAccess = useHasAccess();
  const [page, setPage] = useState(1);
  const { control, watch } = useForm<UserFilterSchemaType>({
    defaultValues: {
      keywords: "",
      role_id: "",
    },
  });
  const keywords = watch("keywords");
  const selectedRoleId = watch("role_id");
  const debouncedKeywords = useDebounce(keywords, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeywords, selectedRoleId]);

  const {
    data: userListData,
    isPending: isUserListPending,
    error: userListError,
  } = useUserListQuery({
    page,
    page_size: DEFAULT_PAGE_SIZE,
    keywords: debouncedKeywords || undefined,
    role_id: selectedRoleId || undefined,
  });
  const [userFormMode, setUserFormMode] = useState<"create" | "edit" | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    username: string;
    full_name: string;
  } | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<{
    id: string;
    username: string;
    full_name: string;
  } | null>(null);

  const users = userListData?.data ?? [];
  const pagination = userListData?.pagination;

  const onOpenCreateUser = () => {
    setSelectedUserId(null);
    setUserFormMode("create");
  };

  const onOpenEditUser = (user: UserListItem) => {
    setSelectedUserId(user.id);
    setUserFormMode("edit");
  };

  const onCloseUserForm = () => {
    setSelectedUserId(null);
    setUserFormMode(null);
  };

  const columns = getUserTableColumns({
    hasAccess,
    onEdit: onOpenEditUser,
    onChangePassword: (user) =>
      setPasswordTarget({
        id: user.id,
        username: user.username,
        full_name: user.full_name,
      }),
    onDelete: (user) =>
      setDeleteTarget({
        id: user.id,
        username: user.username,
        full_name: user.full_name,
      }),
  });

  if (userListError) return <InternalServerError />;

  return (
    <>
      <PageHeader
        title="User Account Management"
        subtitle="Create, update, and maintain user accounts for your application."
        breadcrumbs={[
          { label: "System", route: undefined },
          { label: "User Accounts", route: undefined },
        ]}
        rightElement={
          hasAccess("C") ? (
            <Button type="button" variant="primary" icon={Plus} onClick={onOpenCreateUser}>
              Add User
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
          placeholder="Search users by name, username, email, or role..."
        />

        <FormInput
          control={control}
          name="role_id"
          type="dropdown"
          placeholder="Filter by role"
          dropdownOptions={[ALL_ROLE_OPTION]}
          loadDropdownOptions={async (filterKeywords) => {
            const response = await dropdownApi.role(filterKeywords);
            return [ALL_ROLE_OPTION, ...(response.data ?? [])];
          }}
        />
      </FilterGrid>

      <Table
        columns={columns}
        data={users}
        loading={isUserListPending}
        emptyText="No user accounts available yet."
        pagination={pagination}
        onPageChange={setPage}
      />

      <UserFormModal
        open={userFormMode !== null}
        mode={userFormMode ?? "create"}
        userId={selectedUserId}
        onClose={onCloseUserForm}
      />

      <UserDeleteModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />

      <UserPasswordModal
        open={passwordTarget !== null}
        target={passwordTarget}
        onClose={() => setPasswordTarget(null)}
      />
    </>
  );
};
