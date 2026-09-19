import { KeyRound, Pencil, Trash2 } from "lucide-react";
import { Badge, Button, type TableColumn } from "../../../../components/ui";
import type { Role } from "../../../../interfaces/role";
import type { HasAccess } from "../../../../store/accessControlStore";

interface RoleTableColumnsProps {
  hasAccess: HasAccess;
  onOpenAccess: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export const getRoleTableColumns = ({
  hasAccess,
  onOpenAccess,
  onEdit,
  onDelete,
}: RoleTableColumnsProps): TableColumn<Role>[] => {
  return [
    {
      key: "identity",
      header: "Role",
      render: (role) => (
        <div className="min-w-[220px]">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{role.code}</Badge>
            <p className="font-semibold text-dark-900">{role.name}</p>
          </div>
          <p className="mt-1 text-sm text-dark-500">
            {role.description || "No description provided for this role."}
          </p>
        </div>
      ),
    },
    {
      key: "id",
      header: "Role ID",
      className: "min-w-[170px]",
      render: (role) => (
        <span className="text-xs uppercase tracking-[0.16em] text-dark-500">{role.id}</span>
      ),
    },
    {
      key: "updated_at",
      header: "Updated At",
      className: "min-w-[180px]",
      render: (role) => role.updated_at,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-[1%] whitespace-nowrap",
      hidden: !hasAccess("AC") && !hasAccess("U") && !hasAccess("D"),
      render: (role) => (
        <div className="flex items-center gap-2">
          {hasAccess("AC") ? (
            <Button
              type="button"
              variant="success"
              icon={KeyRound}
              onClick={() => onOpenAccess(role)}
            />
          ) : null}
          {hasAccess("U") ? (
            <Button type="button" variant="warning" icon={Pencil} onClick={() => onEdit(role)} />
          ) : null}
          {hasAccess("D") ? (
            <Button type="button" variant="danger" icon={Trash2} onClick={() => onDelete(role)} />
          ) : null}
        </div>
      ),
    },
  ];
};
