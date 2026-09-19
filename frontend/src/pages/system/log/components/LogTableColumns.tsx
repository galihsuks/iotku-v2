import { Badge, type TableColumn } from "../../../../components/ui";
import type { LogItem } from "../../../../interfaces/log";

const levelVariant: Record<LogItem["level"], "info" | "warning" | "danger"> = {
  info: "info",
  warning: "warning",
  error: "danger",
};

export const getLogTableColumns = (): TableColumn<LogItem>[] => {
  return [
    {
      key: "created_at",
      header: "Created At",
      className: "min-w-[110px]",
      render: (log) => (
        <div>
          <p className="text-xs">{log.created_at.split(" ")[0]}</p>
          <p className="text-xs">{log.created_at.split(" ")[1]}</p>
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      className: "min-w-[40px]",
      render: (log) => <Badge variant={levelVariant[log.level]}>{log.level}</Badge>,
    },
    {
      key: "message",
      header: "Message",
      render: (log) => (
        <div className="min-w-[1000px]">
          <p className="font-semibold text-dark-900">{log.message}</p>
          <p className="mt-1 break-all text-xs text-dark-500">{log.context || "{}"}</p>
        </div>
      ),
    },
  ];
};
