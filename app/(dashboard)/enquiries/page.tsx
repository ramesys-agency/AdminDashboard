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
import { Eye } from "lucide-react";

type EnquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  createdAt: string;
};

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "success" | "purple" | "info" | "outline"> = {
    RESOLVED: "success",
    CONTACTED: "purple",
    NEW: "info",
  };
  return <Badge variant={variantMap[status] ?? "outline"}>{status}</Badge>;
}

export default function EnquiriesPage() {
  const { activeBusiness } = useBusiness();
  const {
    data,
    metadata,
    loading,
    refreshing,
    setPage,
    search,
    setSearch,
    filters,
    setFilter,
  } = usePaginatedList<EnquiryRow>(
    activeBusiness === "vydhra" ? "/vydhra/enquiries" : "/ramesys/enquiries",
    { errorMessage: "Failed to load enquiries. Please try again." }
  );

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Name", accessor: "name" as const },
    { header: "Email", accessor: "email" as const },
    { header: "Phone", accessor: (row: EnquiryRow) => row.phone || "N/A" },
    { header: "Status", accessor: (row: EnquiryRow) => <StatusBadge status={row.status} /> },
    { header: "Received", accessor: (row: EnquiryRow) => new Date(row.createdAt).toLocaleDateString() },
    {
      header: "Actions",
      accessor: (row: EnquiryRow) => (
        <Link href={`/enquiries/${row.id}`}>
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
        title="Enquiries"
        description="View and manage all incoming business enquiries."
      />

      <TableControls
        onSearch={setSearch}
        searchValue={search}
        placeholder="Search by name, email or message..."
      >
        <select
          className={selectClass}
          value={filters.status ?? "all"}
          onChange={(e) => setFilter("status", e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="RESOLVED">Resolved</option>
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
