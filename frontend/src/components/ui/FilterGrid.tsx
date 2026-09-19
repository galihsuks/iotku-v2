import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useCollapseDesktopSidebar } from "../../store/layoutStore";

interface FilterGridProps {
  children: ReactNode;
  className?: string;
}

export const FilterGrid = ({ children, className }: FilterGridProps) => {
  const collapseDesktopSidebar = useCollapseDesktopSidebar();
  return (
    <div
      className={cn(
        "mb-5 grid grid-cols-1 gap-2",
        collapseDesktopSidebar
          ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:lg:grid-cols-5"
          : "md:grid-cols-2 lg:grid-cols-3 xl:lg:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
};
