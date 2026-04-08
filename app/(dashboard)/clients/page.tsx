"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { TableControls } from "@/components/common/TableControls";
import { useBusiness } from "@/context/BusinessContext";
import { apiClient, PaginatedResponse, PaginationMetadata } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";

type ClientRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  _count: { projects: number };
  createdAt: string;
};

export default function ClientsPage() {
  const { activeBusiness } = useBusiness();
  const [data, setData] = useState<ClientRow[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetadata | undefined>();
  const [loading, setLoading] = useState(true);
  
  // Query state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async (p: number, q: string) => {
    if (activeBusiness !== "ramesys") return;
    
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: p.toString(),
        limit: "10",
        ...(q && { q }),
      });
      
      const res = await apiClient.get<PaginatedResponse<ClientRow>>(`/ramesys/clients?${query}`);
      setData(res.data);
      setMetadata(res.metadata);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(page, search);
    }, 300); // Simple debounce
    
    return () => clearTimeout(timer);
  }, [page, search, fetchData]);

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Client Name", accessor: "name" as const },
    { header: "Email", accessor: "email" as const },
    { header: "Company", accessor: (row: ClientRow) => row.company || "N/A" },
    { header: "Projects Count", accessor: (row: ClientRow) => row._count?.projects || 0 },
    { 
      header: "Actions", 
      accessor: (row: ClientRow) => (
        <Link href={`/clients/${row.id}`}>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      )
    },
  ];

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <PageHeader
        title="Clients"
        description="Manage your IT client portfolio and contacts."
        action={
          <Link href="/clients/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </Link>
        }
      />

      {activeBusiness === "ramesys" && (
        <TableControls 
          onSearch={handleSearch} 
          searchValue={search}
          placeholder="Search by name, email or company..."
        />
      )}
      
      {activeBusiness === "ramesys" ? (
        loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse border rounded-xl">Loading clients...</div>
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
          Switch to Ramesys to view Clients.
        </div>
      )}
    </div>
  );
}
