"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  filters?: ReactNode;
}

export function DataTableToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  actions,
  filters,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
      <div className="flex-1 w-full sm:w-auto">
        {onSearchChange && (
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
            style={{ borderColor: "#e5e7eb" }}
          />
        )}
      </div>
      {filters && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters}
        </div>
      )}
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

