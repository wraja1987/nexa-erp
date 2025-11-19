"use client";

import { ReactNode, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/Card";

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Search...",
  onRowClick,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(columns.map(c => c.key)));

  // Filter data
  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      columns.some((col) => {
        const value = col.accessor ? col.accessor(row) : row[col.key];
        return String(value).toLowerCase().includes(search.toLowerCase());
      })
    );
  }, [data, search, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    const column = columns.find((c) => c.key === sortColumn);
    if (!column || !column.sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = column.accessor ? column.accessor(a) : a[column.key];
      const bVal = column.accessor ? column.accessor(b) : b[column.key];
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(key);
      setSortDirection("asc");
    }
  };

  return (
    <Card>
      {searchable && (
        <div className="px-6 py-4 border-b" style={{ borderColor: "#e5e7eb" }}>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
            style={{ borderColor: "#e5e7eb" }}
          />
        </div>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "#e5e7eb", background: "#f8fafc" }}>
                {columns
                  .filter((col) => visibleColumns.has(col.key))
                  .map((column) => (
                    <th
                      key={column.key}
                      className={`text-left px-4 py-3 font-semibold ${column.hideOnMobile ? "hidden md:table-cell" : ""}`}
                      style={{ color: "#0f172a" }}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.header}</span>
                        {column.sortable && sortColumn === column.key && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center" style={{ color: "#6b7280" }}>
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-b hover:bg-[#f8fafc] transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                    style={{ borderColor: "#e5e7eb" }}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns
                      .filter((col) => visibleColumns.has(col.key))
                      .map((column) => (
                        <td
                          key={column.key}
                          className={`px-4 py-3 ${column.hideOnMobile ? "hidden md:table-cell" : ""}`}
                          style={{ color: "#0f172a" }}
                        >
                          {column.accessor ? column.accessor(row) : String(row[column.key] ?? "")}
                        </td>
                      ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

