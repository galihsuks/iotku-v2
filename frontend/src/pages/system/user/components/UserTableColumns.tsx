import { KeyRound, Pencil, Trash2 } from "lucide-react";
import { Badge, Button, type TableColumn } from "../../../../components/ui";
import type { UserListItem } from "../../../../interfaces/user";
import type { HasAccess } from "../../../../store/accessControlStore";

interface UserTableColumnsProps {
  hasAccess: HasAccess;
  onEdit: (user: UserListItem) => void;
  onChangePassword: (user: UserListItem) => void;
  onDelete: (user: UserListItem) => void;
}

export const getUserTableColumns = ({
  hasAccess,
  onEdit,
  onChangePassword,
  onDelete,
}: UserTableColumnsProps): TableColumn<UserListItem>[] => {
  return [
    {
      key: "identity",
      header: "Account",
      render: (user) => (
        <div className="min-w-[240px]">
          <p className="font-semibold text-dark-900">{user.full_name}</p>
          <p className="mt-1 text-sm text-dark-500">@{user.username}</p>
          <p className="mt-1 text-sm text-dark-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role_name",
      header: "Role",
      className: "min-w-[160px]",
      render: (user) =>
        user.role_name ? (
          <Badge variant="secondary">{user.role_name}</Badge>
        ) : (
          <span className="text-sm text-dark-400">No role</span>
        ),
    },
    {
      key: "updated_at",
      header: "Updated At",
      className: "min-w-[180px]",
      render: (user) => user.updated_at,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-[1%] whitespace-nowrap",
      hidden: !hasAccess("U") && !hasAccess("CP") && !hasAccess("D"),
      render: (user) => (
        <div className="flex items-center gap-2">
          {hasAccess("U") ? (
            <Button type="button" variant="warning" icon={Pencil} onClick={() => onEdit(user)} />
          ) : null}
          {hasAccess("CP") ? (
            <Button
              type="button"
              variant="secondary-outline"
              icon={KeyRound}
              onClick={() => onChangePassword(user)}
            />
          ) : null}
          {hasAccess("D") ? (
            <Button type="button" variant="danger" icon={Trash2} onClick={() => onDelete(user)} />
          ) : null}
        </div>
      ),
    },
  ];
};
