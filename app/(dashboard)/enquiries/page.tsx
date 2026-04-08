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
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    RESOLVED: "default",
    CONTACTED: "secondary",
    NEW: "outline",
  };
  return <Badge variant={map[status] ?? "outline"}>{status}</Badge>;
}

export default function EnquiriesPage() {
  const { activeBusiness } = useBusiness();
  const [data, setData] = useState<EnquiryRow[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetadata | undefined>();
  const [loading, setLoading] = useState(true);

  // Query state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(async (p: number, q: string, status: string) => {
    if (activeBusiness !== "ramesys") return;
    
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: p.toString(),
        limit: "10",
        ...(q && { q }),
        ...(status !== "all" && { status }),
      });
      
      const res = await apiClient.get<PaginatedResponse<EnquiryRow>>(`/ramesys/enquiries?${query}`);
      setData(res.data);
      setMetadata(res.metadata);
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(page, search, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter, fetchData]);

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
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      )
    },
  ];

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <PageHeader
        title="Enquiries"
        description="View and manage all incoming client enquiries."
      />

      {activeBusiness === "ramesys" && (
        <TableControls 
          onSearch={handleSearch} 
          searchValue={search}
          placeholder="Search by name, email or message..."
        >
          <select 
            className="h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="all">All Status</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </TableControls>
      )}

      {activeBusiness === "ramesys" ? (
        loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse border rounded-xl">Loading enquiries...</div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            keyExtractor={(row) => row.id}
            metadata={metadata}
            onPageChange={setPage}
          />
        )
      ) : (
        <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed bg-muted/20">
          Switch to Ramesys to view Enquiries.
        </div>
      )}
    </div>
  );
}
