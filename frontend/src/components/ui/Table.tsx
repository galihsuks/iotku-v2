import { cn } from "../../utils/cn";
import type { ReactNode } from "react";
import type { ApiPagination } from "../../interfaces/api";
import { useCollapseDesktopSidebar } from "../../store/layoutStore";
import { PaginationControls } from "./PaginationControls";

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  align?: "left" | "center" | "right";
  className?: string;
  hidden?: boolean;
  render?: (item: T, index: number) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  className?: string;
  tableClassName?: string;
  loading?: boolean;
  emptyText?: string;
  rowKey?: (item: T, index: number) => string;
  pagination?: ApiPagination;
  onPageChange?: (page: number) => void;
  showNumber?: boolean;
  isInModal?: boolean;
}

const alignClassMap: Record<NonNullable<TableColumn<unknown>["align"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export const Table = <T,>({
  columns,
  data,
  className,
  tableClassName,
  loading = false,
  emptyText = "No data available.",
  rowKey,
  pagination,
  onPageChange,
  showNumber = true,
  isInModal = false,
}: TableProps<T>) => {
  const collapseDesktopSidebar = useCollapseDesktopSidebar();
  const visibleColumns = columns.filter((column) => !column.hidden);
  const columnCount = visibleColumns.length + (showNumber ? 1 : 0);

  return (
    <>
      <div className={cn("overflow-hidden rounded-2xl border border-dark-200 bg-white", className)}>
        <div
          className={cn(
            "transition-all duration-300 overflow-x-auto w-[calc(100vw-var(--spacing)*9-var(--spacing)*12)]",
            isInModal ? "max-w-full" : "",
            isInModal
              ? ""
              : collapseDesktopSidebar
                ? "md:w-[calc(100vw-var(--spacing)*12-var(--spacing)*4-80px-var(--spacing)*16)] max-w-[calc(1400px-var(--spacing)*16-80px-var(--spacing)*1-var(--spacing)*16)]"
                : "md:w-[calc(100vw-var(--spacing)*12-var(--spacing)*4-280px-var(--spacing)*16)] max-w-[calc(1400px-var(--spacing)*16-280px-var(--spacing)*1-var(--spacing)*16)]",
          )}
        >
          <table className={cn("min-w-full divide-y divide-dark-200", tableClassName)}>
            <thead className="bg-primary-50/70">
              <tr>
                {showNumber ? (
                  <th className="text-center w-[1%] whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-dark-700">
                    No
                  </th>
                ) : null}
                {visibleColumns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      "px-3 py-2 sm:px-4 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-dark-700 text-nowrap",
                      alignClassMap[column.align ?? "left"],
                      column.className,
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-dark-500" colSpan={columnCount}>
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-dark-500" colSpan={columnCount}>
                    {emptyText}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={rowKey ? rowKey(item, index) : `${index}`}>
                    {showNumber ? (
                      <td className="text-center px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-dark-500">
                        {pagination
                          ? (pagination.page - 1) * pagination.page_size + index + 1
                          : index + 1}
                      </td>
                    ) : null}
                    {visibleColumns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn(
                          "px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-dark-700",
                          alignClassMap[column.align ?? "left"],
                          column.className,
                        )}
                      >
                        {column.render
                          ? column.render(item, index)
                          : String((item as Record<string, unknown>)[String(column.key)] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination ? (
        <PaginationControls pagination={pagination} onPageChange={onPageChange} />
      ) : null}
    </>
  );
};
