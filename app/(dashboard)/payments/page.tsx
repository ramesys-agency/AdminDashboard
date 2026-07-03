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

type PaymentRow = {
  id: string;
  amount: number;
  currency?: string | null;
  status: string;
  method: string | null;
  project?: { id: string; name: string } | null;
  student?: { id: string; name: string } | null;
  invoice?: { id: string } | null;
  createdAt: string;
};

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "success" | "warning" | "destructive" | "outline"> = {
    COMPLETED: "success",
    PENDING: "warning",
    FAILED: "destructive",
  };
  return <Badge variant={variantMap[status] ?? "outline"}>{status}</Badge>;
}

export default function PaymentsPage() {
  const { activeBusiness } = useBusiness();
  const { data, metadata, loading, refreshing, setPage, filters, setFilter } =
    usePaginatedList<PaymentRow>(
      activeBusiness === "vydhra" ? "/vydhra/payments" : "/ramesys/payments",
      { errorMessage: "Failed to load payments. Please try again." }
    );

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Amount", accessor: (row: PaymentRow) => formatAmount(row.amount, row.currency) },
    { header: "Status", accessor: (row: PaymentRow) => <StatusBadge status={row.status} /> },
    { header: "Method", accessor: (row: PaymentRow) => row.method || "N/A" },
    ...(activeBusiness === "vydhra"
      ? [{ header: "Student", accessor: (row: PaymentRow) => row.student?.name || "N/A" }]
      : [{ header: "Project", accessor: (row: PaymentRow) => row.project?.name || "N/A" }]),
    { header: "Date", accessor: (row: PaymentRow) => new Date(row.createdAt).toLocaleDateString() },
    {
      header: "Actions",
      accessor: (row: PaymentRow) => (
        <Link href={`/payments/${row.id}`}>
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
        title="Payments"
        description="Monitor all financial transactions and payment statuses."
        action={
          activeBusiness === "ramesys" ? (
            <Link href="/payments/new">
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Generate Payment Link
              </Button>
            </Link>
          ) : undefined
        }
      />

      <TableControls onSearch={() => {}} searchValue="" placeholder="Filter payments...">
        <select
          className={selectClass}
          value={filters.status ?? "all"}
          onChange={(e) => setFilter("status", e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>
        <select
          className={selectClass}
          value={filters.method ?? "all"}
          onChange={(e) => setFilter("method", e.target.value)}
        >
          <option value="all">All Methods</option>
          <option value="CARD">Card</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="UPI">UPI</option>
          <option value="CASH">Cash</option>
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
