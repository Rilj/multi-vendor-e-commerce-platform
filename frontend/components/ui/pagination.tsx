import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push("...");
      for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {total} results
      </div>
      <div className="flex items-center space-x-2">
        <button
          className="rounded-lg border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <MoreHorizontal key={i} className="h-4 w-4 text-muted-foreground" />
          ) : (
            <button
              key={page}
              className={cn(
                "rounded-lg border border-input px-3 py-1 text-sm",
                page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </button>
          ),
        )}
        <button
          className="rounded-lg border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
