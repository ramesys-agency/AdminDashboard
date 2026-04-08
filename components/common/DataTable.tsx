import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  metadata,
  onPageChange,
}: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 mt-4 bg-muted/40">
        <p className="text-muted-foreground">No data available.</p>
      </Card>
    );
  }

  const startIdx = metadata ? (metadata.page - 1) * metadata.limit + 1 : 1;
  const endIdx = metadata ? Math.min(metadata.page * metadata.limit, metadata.total) : data.length;

  return (
    <Card className="mt-4 overflow-hidden border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b hover:bg-slate-50/80">
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className="font-semibold text-slate-900 text-xs uppercase tracking-wider h-12 px-6"
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={keyExtractor(row)}
                className="hover:bg-muted/30 transition-colors"
              >
                {columns.map((col, idx) => (
                  <TableCell
                    key={idx}
                    className="py-4 px-6 text-sm text-slate-600"
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
        <div className="flex items-center justify-between px-6 py-3 border-t bg-slate-50/50">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{startIdx}</span> to{" "}
            <span className="font-medium text-foreground">{endIdx}</span> of{" "}
            <span className="font-medium text-foreground">{metadata.total}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={metadata.page <= 1}
              onClick={() => onPageChange?.(metadata.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-xs font-medium px-2">
              Page {metadata.page} of {metadata.pages}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={metadata.page >= metadata.pages}
              onClick={() => onPageChange?.(metadata.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
