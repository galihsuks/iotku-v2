import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { ApiPagination } from "../../interfaces/api";
import { useCollapseDesktopSidebar } from "../../store/layoutStore";
import { cn } from "../../utils/cn";
import { Button } from "./Button";

interface PaginationControlsProps {
  pagination: ApiPagination;
  onPageChange?: (page: number) => void;
  className?: string;
}

const buildPaginationItems = (currentPage: number, totalPages: number): Array<number | "..."> => {
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 2) {
    return [1, 2, 3, ...(totalPages > 3 ? (["..."] as const) : [])];
  }

  if (currentPage >= totalPages - 1) {
    return [
      ...(totalPages > 3 ? (["..."] as const) : []),
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return ["...", currentPage - 1, currentPage, currentPage + 1, "..."];
};

export const PaginationControls = ({
  pagination,
  onPageChange,
  className,
}: PaginationControlsProps) => {
  const collapseDesktopSidebar = useCollapseDesktopSidebar();
  const paginationItems = buildPaginationItems(pagination.page, pagination.total_pages);

  return (
    <div
      className={cn(
        "flex flex-col-reverse items-center justify-between gap-3 border-t border-dark-100 py-4",
        collapseDesktopSidebar ? "md:flex-row" : "lg:flex-row",
        className,
      )}
    >
      <p className="text-xs sm:text-sm text-dark-500">
        Page {pagination.page} of {pagination.total_pages} with {pagination.total_items} total
        item(s).
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="light-outline"
          icon={ChevronsLeft}
          disabled={!pagination.has_prev}
          onClick={() => onPageChange?.(1)}
        />
        <div className={cn("hidden", collapseDesktopSidebar ? "lg:block" : "xl:block")}>
          <Button
            type="button"
            variant="light-outline"
            icon={ChevronLeft}
            disabled={!pagination.has_prev}
            onClick={() => onPageChange?.(pagination.page - 1)}
          />
        </div>
        {paginationItems.map((item, index) =>
          item === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className={cn(
                "hidden h-10 items-center justify-center px-2 text-xs sm:text-sm font-semibold text-dark-400 sm:inline-flex lg:inline-flex",
                collapseDesktopSidebar ? "" : "md:hidden",
              )}
            >
              ...
            </span>
          ) : (
            <Button
              key={`page-${item}`}
              type="button"
              variant={item === pagination.page ? "primary" : "light-outline"}
              className="min-w-10 px-3"
              onClick={() => onPageChange?.(item)}
            >
              {item}
            </Button>
          ),
        )}
        <div className={cn("hidden", collapseDesktopSidebar ? "lg:block" : "xl:block")}>
          <Button
            type="button"
            variant="light-outline"
            icon={ChevronRight}
            disabled={!pagination.has_next}
            onClick={() => onPageChange?.(pagination.page + 1)}
          />
        </div>
        <Button
          type="button"
          variant="light-outline"
          icon={ChevronsRight}
          disabled={!pagination.has_next}
          onClick={() => onPageChange?.(pagination.total_pages)}
        />
      </div>
    </div>
  );
};
