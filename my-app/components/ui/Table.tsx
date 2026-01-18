"use client";

import { ReactNode } from "react";

export interface TableColumn {
  key: string;
  header: string;
  className?: string;
  render?: (value: any, row: any) => ReactNode;
}

export interface TableProps {
  columns: TableColumn[];
  data: any[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
  empty?: ReactNode;
  className?: string;
  stickyHeader?: boolean;
}

export function Table({
  columns,
  data,
  onRowClick,
  loading = false,
  empty,
  className = "",
  stickyHeader = false,
}: TableProps) {
  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-0">
        {/* Mobile cards loading */}
        <div className="sm:hidden space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-muted rounded flex-1"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table loading */}
        <div className="hidden sm:block bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider"
                    >
                      <div className="h-4 bg-muted rounded w-20"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((column, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-muted rounded w-24"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        {empty || <p className="text-muted-foreground">No data available.</p>}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Mobile: Card Layout */}
      <div className="sm:hidden space-y-4">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`bg-card rounded-xl p-4 border border-border transition-all ${
              onRowClick ? "active:scale-[0.98] cursor-pointer" : ""
            }`}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((column) => {
              const value = row[column.key];
              const renderedValue = column.render ? column.render(value, row) : value;

              // Skip rendering first column as it's usually the title shown separately
              if (column.key === columns[0].key) {
                return (
                  <div key={column.key} className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {renderedValue}
                      </h3>
                    </div>
                  </div>
                );
              }

              return (
                <div key={column.key} className="flex justify-between items-center py-1.5 text-sm">
                  <span className="text-muted-foreground">{column.header}</span>
                  <span className={`text-foreground text-right ${column.className || ""}`}>
                    {renderedValue}
                  </span>
                </div>
              );
            })}

            {/* Add tap indicator for clickable rows */}
            {onRowClick && (
              <div className="mt-3 pt-3 border-t border-border text-center">
                <span className="text-xs text-primary font-medium">View Details →</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden sm:block bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`bg-muted/50 border-b border-border ${stickyHeader ? "sticky-header" : ""}`}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider ${column.className || ""}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`transition-all ${
                    onRowClick ? "hover:bg-muted/30 cursor-pointer active:bg-muted/50" : ""
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => {
                    const value = row[column.key];
                    const renderedValue = column.render ? column.render(value, row) : value;

                    return (
                      <td
                        key={column.key}
                        className={`px-6 py-4 ${column.className || ""}`}
                      >
                        {renderedValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
