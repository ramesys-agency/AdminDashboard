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

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
}: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 mt-4 bg-muted/40">
        <p className="text-muted-foreground">No data available.</p>
      </Card>
    );
  }

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
    </Card>
  );
}
