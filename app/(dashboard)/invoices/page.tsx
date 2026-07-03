"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { TableControls } from "@/components/common/TableControls";
import { useBusiness } from "@/context/BusinessContext";
import { usePaginatedList } from "@/lib/use-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus } from "lucide-react";

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", INR: "₹", EUR: "€", GBP: "£", AED: "د.إ" };
function formatAmount(amount: number, currency?: string | null) {
  const sym = CURRENCY_SYMBOLS[(currency ?? "USD").toUpperCase()] ?? currency ?? "$";
  return `${sym}${amount.toLocaleString()}`;
}

type InvoiceRow = {
  id: string;
  amount: number;
  status: string;
  dueDate: string | null;
  project?: { id: string; name: string } | null;
  payments?: Array<{
    currency?: string | null;
    student: { name: string };
    courseEnrollment?: { course: { name: string } } | null;
  }>;
  createdAt: string;
};

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "success" | "warning" | "destructive" | "outline"> = {
    PAID: "success",
    PENDING: "warning",
    CANCELLED: "destructive",
  };
  return <Badge variant={variantMap[status] ?? "outline"}>{status}</Badge>;
}

export default function InvoicesPage() {
  const { activeBusiness } = useBusiness();
  const { data, metadata, loading, refreshing, setPage, filters, setFilter } =
    usePaginatedList<InvoiceRow>(
      activeBusiness === "vydhra" ? "/vydhra/invoices" : "/ramesys/invoices",
      { errorMessage: "Failed to load invoices. Please try again." }
    );

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Amount", accessor: (row: InvoiceRow) => formatAmount(row.amount, row.payments?.[0]?.currency) },
    { header: "Status", accessor: (row: InvoiceRow) => <StatusBadge status={row.status} /> },
    ...(activeBusiness === "vydhra"
      ? [
          {
            header: "Course",
            accessor: (row: InvoiceRow) =>
              row.payments?.[0]?.courseEnrollment?.course?.name || "N/A",
          },
          {
            header: "Student",
            accessor: (row: InvoiceRow) => row.payments?.[0]?.student?.name || "N/A",
          },
        ]
      : [
          {
            header: "Project",
            accessor: (row: InvoiceRow) => row.project?.name || "N/A",
          },
        ]),
    {
      header: "Due Date",
      accessor: (row: InvoiceRow) =>
        row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "N/A",
    },
    {
      header: "Actions",
      accessor: (row: InvoiceRow) => (
        <Link href={`/invoices/${row.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-muted">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  const selectClass =
    "h-9 px-3 rounded-lg border border-border/60 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all hover:bg-muted/50";

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <PageHeader
        title="Invoices"
        description="Manage and track all business invoices."
        action={
          activeBusiness === "ramesys" ? (
            <Link href="/invoices/new">
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Generate Invoice
              </Button>
            </Link>
          ) : undefined
        }
      />

      <TableControls onSearch={() => {}} searchValue="">
        <select
          className={selectClass}
          value={filters.status ?? "all"}
          onChange={(e) => setFilter("status", e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </TableControls>

      <DataTable
        data={data}
        columns={columns}
        keyExtractor={(row) => row.id}
        metadata={metadata}
        onPageChange={setPage}
        loading={loading}
        refreshing={refreshing}
      />
    </div>
  );
}
