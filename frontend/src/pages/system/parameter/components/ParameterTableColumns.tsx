import { Pencil, Trash2 } from "lucide-react";
import { Badge, Button, type TableColumn } from "../../../../components/ui";
import type { Parameter } from "../../../../interfaces/parameter";
import type { HasAccess } from "../../../../store/accessControlStore";

interface ParameterTableColumnsProps {
  hasAccess: HasAccess;
  onEdit: (parameter: Parameter) => void;
  onDelete: (parameter: Parameter) => void;
}

export const getParameterTableColumns = ({
  hasAccess,
  onEdit,
  onDelete,
}: ParameterTableColumnsProps): TableColumn<Parameter>[] => {
  return [
    {
      key: "key",
      header: "Key",
      render: (parameter) => (
        <div className="min-w-[220px]">
          <p className="font-semibold text-dark-900">{parameter.key}</p>
          <p className="mt-1 break-all text-sm text-dark-500">{parameter.value}</p>
        </div>
      ),
    },
    {
      key: "datatype",
      header: "Datatype",
      className: "min-w-[160px]",
      render: (parameter) => <Badge variant="secondary">{parameter.datatype}</Badge>,
    },
    {
      key: "updated_at",
      header: "Updated At",
      className: "min-w-[180px]",
      render: (parameter) => parameter.updated_at,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-[1%] whitespace-nowrap",
      hidden: !hasAccess("U") && !hasAccess("D"),
      render: (parameter) => (
        <div className="flex items-center gap-2">
          {hasAccess("U") ? (
            <Button
              type="button"
              variant="warning"
              icon={Pencil}
              onClick={() => onEdit(parameter)}
            />
          ) : null}
          {hasAccess("D") ? (
            <Button
              type="button"
              variant="danger"
              icon={Trash2}
              onClick={() => onDelete(parameter)}
            />
          ) : null}
        </div>
      ),
    },
  ];
};
