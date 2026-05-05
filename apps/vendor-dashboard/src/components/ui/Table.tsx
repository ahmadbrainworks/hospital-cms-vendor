"use client";

import { ReactNode } from "react";

interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
}

interface TableRow {
  [key: string]: ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  rows: TableRow[];
  striped?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  emptyState?: ReactNode;
}

export function Table({
  columns,
  rows,
  striped = true,
  hoverable = true,
  loading = false,
  emptyState,
}: TableProps) {
  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-800 overflow-hidden transition-motion">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-700 bg-neutral-900/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-left font-semibold text-neutral-300 transition-micro"
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && (
                      <span className="text-neutral-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        ⇅
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-subtle" />
                    <span className="text-neutral-400">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  {emptyState ? (
                    emptyState
                  ) : (
                    <div className="text-neutral-400">
                      <p className="font-medium text-neutral-300">No data available</p>
                      <p className="text-xs mt-1 text-neutral-500">Try adjusting your filters</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-neutral-700 transition-motion ${
                    hoverable
                      ? "hover:bg-neutral-700/40 hover:shadow-sm cursor-pointer"
                      : ""
                  } ${striped && idx % 2 === 1 ? "bg-neutral-900/20" : ""}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-neutral-200"
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
