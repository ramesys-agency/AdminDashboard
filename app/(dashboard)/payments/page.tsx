"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { TableControls } from "@/components/common/TableControls";
import { useBusiness } from "@/context/BusinessContext";
import { apiClient, PaginatedResponse, PaginationMetadata } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus } from "lucide-react";

type PaymentRow = {
  id: string;
  amount: number;
  status: string;
  method: string | null;
  project: { id: string; name: string } | null;
  invoice: { id: string } | null;
  createdAt: string;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    COMPLETED: "default",
    PENDING: "outline",
    FAILED: "destructive",
  };
  return <Badge variant={map[status] ?? "outline"}>{status}</Badge>;
}

export default function PaymentsPage() {
  const { activeBusiness } = useBusiness();
  const [data, setData] = useState<PaymentRow[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetadata | undefined>();
  const [loading, setLoading] = useState(true);

  // Query state
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  const fetchData = useCallback(async (p: number, status: string, method: string) => {
    if (activeBusiness !== "ramesys") return;
    
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: p.toString(),
        limit: "10",
        ...(status !== "all" && { status }),
        ...(method !== "all" && { method }),
      });
      
      const res = await apiClient.get<PaginatedResponse<PaymentRow>>(`/ramesys/payments?${query}`);
      setData(res.data);
      setMetadata(res.metadata);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => {
    async function getApiData() {
      await fetchData(page, statusFilter, methodFilter);
    }
    getApiData();
  }, [page, statusFilter, methodFilter, fetchData]);

  // Combine API data with localStorage data for demo
  const combinedData = React.useMemo(() => {
    if (typeof window === "undefined") return data;
    
    const mockPayments = JSON.parse(localStorage.getItem("mock_payments") || "[]");
    
    // Simple filter for mock data to match existing filters
    const filteredMock = mockPayments.filter((p: PaymentRow) => {
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const matchMethod = methodFilter === "all" || p.method === methodFilter;
      return matchStatus && matchMethod;
    });

    // Merge and show mock data at the top
    return [...filteredMock, ...data];
  }, [data, statusFilter, methodFilter]);

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Amount", accessor: (row: PaymentRow) => `₹${row.amount.toLocaleString()}` },
    { header: "Status", accessor: (row: PaymentRow) => <StatusBadge status={row.status} /> },
    { header: "Method", accessor: (row: PaymentRow) => row.method || "N/A" },
    { header: "Project", accessor: (row: PaymentRow) => row.project?.name || "N/A" },
    { header: "Date", accessor: (row: PaymentRow) => new Date(row.createdAt).toLocaleDateString() },
    {
      header: "Actions",
      accessor: (row: PaymentRow) => (
        <Link href={`/payments/${row.id}`}>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      )
    },
  ];

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMethodFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <PageHeader
        title="Payments"
        description="Monitor all financial transactions and payment statuses."
        action={
          <Link href="/payments/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </Link>
        }
      />

      {activeBusiness === "ramesys" && (
        <TableControls 
          onSearch={() => {}} 
          searchValue=""
          placeholder="Filter payments..."
        >
          <select 
            className="h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
          <select 
            className="h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={methodFilter}
            onChange={handleMethodChange}
          >
            <option value="all">All Methods</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="CASH">Cash</option>
          </select>
        </TableControls>
      )}

      {activeBusiness === "ramesys" ? (
        loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse border rounded-xl">Loading payments...</div>
        ) : (
          <DataTable
            data={combinedData}
            columns={columns}
            keyExtractor={(row) => row.id}
            metadata={metadata}
            onPageChange={setPage}
          />
        )
      ) : (
        <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed bg-muted/20">
          Switch to Ramesys to view Payments.
        </div>
      )}
    </div>
  );
}
