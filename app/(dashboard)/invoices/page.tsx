"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { TableControls } from "@/components/common/TableControls";
import { useBusiness } from "@/context/BusinessContext";
import {
  apiClient,
  PaginatedResponse,
  PaginationMetadata,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus } from "lucide-react";

type InvoiceRow = {
  id: string;
  amount: number;
  status: string;
  dueDate: string | null;
  project?: { id: string; name: string } | null;
  payments?: Array<{
    student: { name: string };
    courseEnrollment: { course: { name: string } };
  }>;
  createdAt: string;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    PAID: "default",
    PENDING: "outline",
    CANCELLED: "destructive",
  };
  return <Badge variant={map[status] ?? "outline"}>{status}</Badge>;
}

export default function InvoicesPage() {
  const { activeBusiness } = useBusiness();
  const [data, setData] = useState<InvoiceRow[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetadata | undefined>();
  const [loading, setLoading] = useState(true);

  // Query state
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(
    async (p: number, status: string) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: p.toString(),
          limit: "10",
          ...(status !== "all" && { status }),
        });

        const endpoint =
          activeBusiness === "vydhra"
            ? "/vydhra/invoices"
            : "/ramesys/invoices";
        const res = await apiClient.get<PaginatedResponse<InvoiceRow>>(
          `${endpoint}?${query}`,
        );
        setData(res.data);
        setMetadata(res.metadata);
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
      } finally {
        setLoading(false);
      }
    },
    [activeBusiness],
  );

  useEffect(() => {
    fetchData(page, statusFilter);
  }, [page, statusFilter, fetchData, activeBusiness]);

  const columns = [
    { header: "ID", accessor: "id" as const },
    {
      header: "Amount",
      accessor: (row: InvoiceRow) => `$${row.amount.toLocaleString()}`,
    },
    {
      header: "Status",
      accessor: (row: InvoiceRow) => <StatusBadge status={row.status} />,
    },
    ...(activeBusiness === "vydhra"
      ? [
          {
            header: "Course",
            accessor: (row: InvoiceRow) =>
              row.payments?.[0]?.courseEnrollment?.course?.name || "N/A",
          },
          {
            header: "Student",
            accessor: (row: InvoiceRow) =>
              row.payments?.[0]?.student?.name || "N/A",
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
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <PageHeader
        title="Invoices"
        description="Manage and track all business invoices."
        action={
          activeBusiness === "ramesys" && (
            <Link href="/invoices/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Generate Invoice
              </Button>
            </Link>
          )
        }
      />

      <TableControls onSearch={() => {}} searchValue="">
        <select
          className="h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all hover:bg-muted/50"
          value={statusFilter}
          onChange={handleStatusChange}
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </TableControls>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse border rounded-xl">
          Loading invoices...
        </div>
      ) : (
        <DataTable
          data={data}
          columns={columns}
          keyExtractor={(row) => row.id}
          metadata={metadata}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
