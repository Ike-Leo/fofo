"use client";

import { ReactNode } from "react";

export interface TableColumn {
  key: string;
  header: string;
  className?: string;
  priority?: "primary" | "secondary" | "tertiary";
  render?: (value: any, row: any) => ReactNode;
}

export interface TableProps {
  columns: TableColumn[];
  data: any[];
  onRowClick?: (row: any) => void;
  onSwipeLeft?: (row: any) => void;
  onSwipeRight?: (row: any) => void;
  loading?: boolean;
  empty?: ReactNode;
  className?: string;
  stickyHeader?: boolean;
}

export function Table({
  columns,
  data,
  onRowClick,
  onSwipeLeft,
  onSwipeRight,
  loading = false,
  empty,
  className = "",
  stickyHeader = false,
}: TableProps) {
  // Loading skeleton with different layouts for mobile vs desktop
  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-0">
        {/* Mobile cards loading */}
        <div className="sm:hidden space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-tertiary rounded-xl p-4 border border-subtle animate-shimmer"
            >
              <div className="h-5 bg-elevated rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-elevated/50 rounded w-1/2 mb-4"></div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="h-8 bg-elevated/30 rounded"></div>
                <div className="h-8 bg-elevated/30 rounded"></div>
              </div>
              <div className="h-10 bg-elevated/20 rounded"></div>
            </div>
          ))}
        </div>

        {/* Desktop table loading */}
        <div className="hidden sm:block bg-tertiary rounded-xl border border-subtle overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="glass border-b border-subtle">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-4 font-semibold text-label-md text-secondary uppercase tracking-wider"
                    >
                      <div className="h-4 bg-elevated rounded w-20"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((column, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-elevated rounded w-24"></div>
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

  // Empty state for both mobile and desktop
  if (!data || data.length === 0) {
    return (
      <div className="bg-tertiary rounded-xl border border-subtle p-8 sm:p-12 text-center">
        {empty || (
          <div className="space-y-3">
            <p className="text-body-md text-secondary">No data available.</p>
          </div>
        )}
      </div>
    );
  }

  // Get columns to show on mobile based on priority
  const getMobileColumns = () => {
    const primary = columns.find((c) => c.priority === "primary") || columns[0];
    const secondary = columns.find((c) => c.priority === "secondary") || columns[1];
    const tertiary = columns.filter((c) => c.priority === "tertiary");

    return { primary, secondary, tertiary };
  };

  const { primary, secondary, tertiary } = getMobileColumns();

  return (
    <div className={`${className}`}>
      {/* Mobile: Card Layout (< 768px) */}
      <div className="sm:hidden space-y-3">
        {data.map((row, rowIndex) => {
          const primaryValue = row[primary.key];
          const secondaryValue = secondary ? row[secondary.key] : null;

          return (
            <div
              key={rowIndex}
              className={`bg-tertiary rounded-xl p-4 border border-subtle transition-fast ${
                onRowClick ? "hover-lift active-scale-sm cursor-pointer" : ""
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {/* Primary field (name/title) */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-heading-md font-semibold text-primary truncate">
                    {primary.render
                      ? primary.render(primaryValue, row)
                      : primaryValue}
                  </h3>
                </div>
                {/* Chevron indicator */}
                {onRowClick && (
                  <svg
                    className="w-5 h-5 text-secondary flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>

              {/* Secondary field (subtitle) */}
              {secondary && (
                <div className="mb-3">
                  {secondary.render ? (
                    secondary.render(secondaryValue, row)
                  ) : (
                    <p className="text-body-sm text-secondary line-clamp-2">
                      {secondaryValue}
                    </p>
                  )}
                </div>
              )}

              {/* Metrics grid (2 columns) */}
              {tertiary && tertiary.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {tertiary.slice(0, 4).map((column) => {
                    const value = row[column.key];
                    const renderedValue = column.render
                      ? column.render(value, row)
                      : value;

                    return (
                      <div
                        key={column.key}
                        className="bg-elevated/50 rounded-lg p-2.5"
                      >
                        <p className="text-label-sm text-tertiary mb-0.5">
                          {column.header}
                        </p>
                        <p className="text-body-sm text-primary truncate">
                          {renderedValue}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Swipe hint if swipeable */}
              {(onSwipeLeft || onSwipeRight) && (
                <div className="pt-2 border-t border-subtle text-center">
                  <p className="text-label-sm text-tertiary">
                    ← Swipe to {onSwipeLeft ? "delete" : ""}
                    {onSwipeLeft && onSwipeRight ? " / " : ""}
                    {onSwipeRight ? "archive" : ""} →
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: Table Layout (≥ 768px) */}
      <div className="hidden sm:block bg-tertiary rounded-xl border border-subtle overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead
              className={`glass border-b border-subtle ${
                stickyHeader ? "sticky top-0 z-10" : ""
              }`}
            >
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-4 font-semibold text-label-md text-secondary uppercase tracking-wider ${column.className || ""}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`transition-fast ${
                    onRowClick
                      ? "hover:bg-elevated/50 cursor-pointer active:bg-elevated"
                      : ""
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => {
                    const value = row[column.key];
                    const renderedValue = column.render
                      ? column.render(value, row)
                      : value;

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
