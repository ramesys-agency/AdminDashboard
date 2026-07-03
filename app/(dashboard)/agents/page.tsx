"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { TableControls } from "@/components/common/TableControls";
import { useBusiness } from "@/context/BusinessContext";
import { usePaginatedList } from "@/lib/use-api";
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
  const { data, metadata, loading, refreshing, setPage, search, setSearch } =
    usePaginatedList<AgentRow>(
      activeBusiness === "vydhra" ? "/vydhra/agents" : null,
      { errorMessage: "Failed to load agents. Please try again." }
    );

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
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-muted">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <PageHeader
        title="Agents"
        description="Manage course referral agents and their commissions."
        action={
          <Link href="/agents/new">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Agent
            </Button>
          </Link>
        }
      />

      {activeBusiness === "vydhra" ? (
        <>
          <TableControls
            onSearch={setSearch}
            searchValue={search}
            placeholder="Search agents..."
          />
          <DataTable
            data={data}
            columns={columns}
            keyExtractor={(row) => row.id}
            metadata={metadata}
            onPageChange={setPage}
            loading={loading}
            refreshing={refreshing}
          />
        </>
      ) : (
        <div className="p-10 text-center text-muted-foreground border rounded-xl border-dashed bg-muted/20 text-sm">
          Switch to Vydhra to view Agents.
        </div>
      )}
    </div>
  );
}
