import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { PaginationMetadata } from "@/lib/api-client";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  metadata?: PaginationMetadata;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  /** New data is loading behind the currently visible rows */
  refreshing?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  metadata,
  onPageChange,
  loading,
  refreshing,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent bg-transparent">
                {columns.map((col, idx) => (
                  <TableHead
                    key={idx}
                    className="h-11 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest bg-transparent"
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent border-0">
                  {columns.map((_, j) => (
                    <TableCell key={j} className="py-3.5 px-5">
                      <div
                        className="h-3.5 bg-gray-100 animate-pulse rounded-full"
                        style={{ width: `${45 + ((i * 3 + j * 7) % 40)}%` }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white">
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Inbox className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">No records found</p>
          <p className="text-xs text-gray-400">Try adjusting your search or filters.</p>
        </div>
      </div>
    );
  }

  const startIdx = metadata ? (metadata.page - 1) * metadata.limit + 1 : 1;
  const endIdx = metadata ? Math.min(metadata.page * metadata.limit, metadata.total) : data.length;

  return (
    <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      <div
        className={`overflow-x-auto transition-opacity duration-150 ${
          refreshing ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent bg-transparent">
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className="h-11 px-5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest bg-transparent"
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {data.map((row) => (
              <TableRow
                key={keyExtractor(row)}
                className="border-0 hover:bg-gray-50/70 transition-colors duration-100"
              >
                {columns.map((col, idx) => (
                  <TableCell
                    key={idx}
                    className="py-3.5 px-5 text-sm text-gray-700"
                  >
                    {typeof col.accessor === "function"
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {metadata && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            Showing{" "}
            <span className="font-medium text-gray-600">{startIdx}–{endIdx}</span>
            {" "}of{" "}
            <span className="font-medium text-gray-600">{metadata.total}</span>
            {" "}results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg gap-1 disabled:opacity-40"
              disabled={metadata.page <= 1}
              onClick={() => onPageChange?.(metadata.page - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </Button>
            <span className="text-xs font-medium text-gray-500 px-2">
              {metadata.page} / {metadata.pages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg gap-1 disabled:opacity-40"
              disabled={metadata.page >= metadata.pages}
              onClick={() => onPageChange?.(metadata.page + 1)}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
