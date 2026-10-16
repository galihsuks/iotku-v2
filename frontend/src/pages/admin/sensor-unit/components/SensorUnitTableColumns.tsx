import { Pencil, Trash2 } from "lucide-react";
import { Button, type TableColumn } from "../../../../components/ui";
import type { SensorUnit } from "../../../../interfaces/sensor";
import type { HasAccess } from "../../../../store/accessControlStore";

interface SensorUnitTableColumnsParams {
  hasAccess: HasAccess;
  onEdit: (sensorUnit: SensorUnit) => void;
  onDelete: (sensorUnit: SensorUnit) => void;
}

export const getSensorUnitTableColumns = ({
  hasAccess,
  onEdit,
  onDelete,
}: SensorUnitTableColumnsParams): TableColumn<SensorUnit>[] => [
  {
    key: "name",
    header: "Name",
    render: (item) => (
      <div>
        <p className="font-semibold text-dark-900">{item.name}</p>
        <p className="mt-1 text-xs text-dark-500">{item.unit}</p>
      </div>
    ),
  },
  {
    key: "value_type",
    header: "Value Type",
    render: (item) => item.value_type,
  },
  {
    key: "widget_type",
    header: "Widget",
    render: (item) => item.widget_type,
  },
  {
    key: "value_options",
    header: "Options",
    render: (item) =>
      item.value_options?.length
        ? item.value_options.map((option) => option.label).join(", ")
        : "-",
  },
  {
    key: "actions",
    header: "Actions",
    align: "center",
    render: (item) => (
      <div className="flex justify-center gap-2">
        {hasAccess("U") ? (
          <Button type="button" variant="warning" icon={Pencil} onClick={() => onEdit(item)} />
        ) : null}
        {hasAccess("D") ? (
          <Button type="button" variant="danger" icon={Trash2} onClick={() => onDelete(item)} />
        ) : null}
      </div>
    ),
  },
];
