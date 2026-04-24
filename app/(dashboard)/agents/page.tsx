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
import { Eye, Plus } from "lucide-react";

type AgentRow = {
  id: string;
  name: string;
  email: string;
  code: string;
  commissionType: "PERCENTAGE" | "FLAT";
  commissionValue: number;
  totalPaid: number;
  createdAt: string;
};

export default function AgentsPage() {
  const { activeBusiness } = useBusiness();
  const [data, setData] = useState<AgentRow[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetadata | undefined>();
  const [loading, setLoading] = useState(true);

  // Query state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(
    async (p: number, q: string) => {
      if (activeBusiness !== "vydhra") return;

      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: p.toString(),
          limit: "10",
          ...(q && { q }),
        });

        const res = await apiClient.get<PaginatedResponse<AgentRow>>(
          `/vydhra/agents?${query}`,
        );
        setData(res.data);
        setMetadata(res.metadata);
      } catch (err) {
        console.error("Failed to fetch agents:", err);
      } finally {
        setLoading(false);
      }
    },
    [activeBusiness],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(page, search);
    }, 300); // Simple debounce

    return () => clearTimeout(timer);
  }, [page, search, fetchData]);

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Name", accessor: "name" as const },
    { header: "Email", accessor: "email" as const },
    { header: "Code", accessor: "code" as const },
    {
      header: "Commission",
      accessor: (row: AgentRow) =>
        row.commissionType === "PERCENTAGE"
          ? `${row.commissionValue || 0}%`
          : `$${(row.commissionValue || 0).toLocaleString()}`,
    },
    {
      header: "Total Paid",
      accessor: (row: AgentRow) => `$${(row.totalPaid || 0).toLocaleString()}`,
    },
    {
      header: "Actions",
      accessor: (row: AgentRow) => (
        <Link href={`/agents/${row.id}`}>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <PageHeader
        title="Agents"
        description="Manage course referral agents and their commissions."
        action={
          <Link href="/agents/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Agent
            </Button>
          </Link>
        }
      />

      {activeBusiness === "vydhra" && (
        <TableControls
          onSearch={handleSearch}
          searchValue={search}
          placeholder="Search agents..."
        />
      )}

      {activeBusiness === "vydhra" ? (
        loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse border rounded-xl">
            Loading agents...
          </div>
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
          Switch to Vydhra to view Agents.
        </div>
      )}
    </div>
  );
}
