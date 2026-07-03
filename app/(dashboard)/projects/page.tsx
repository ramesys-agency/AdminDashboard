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

type ProjectRow = {
  id: string;
  name: string;
  status: string;
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  client: { id: string; name: string } | null;
};

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "info" | "success" | "warning" | "outline"> = {
    IN_PROGRESS: "info",
    COMPLETED: "success",
    PENDING: "warning",
  };
  return (
    <Badge variant={variantMap[status] ?? "outline"}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export default function ProjectsPage() {
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
  } = usePaginatedList<ProjectRow>(
    activeBusiness === "ramesys" ? "/ramesys/projects" : null,
    { errorMessage: "Failed to load projects. Please try again." }
  );

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Project Name", accessor: "name" as const },
    { header: "Client", accessor: (row: ProjectRow) => row.client?.name || "N/A" },
    {
      header: "Budget",
      accessor: (row: ProjectRow) =>
        row.budget ? `$${row.budget.toLocaleString()}` : "N/A",
    },
    { header: "Status", accessor: (row: ProjectRow) => <StatusBadge status={row.status} /> },
    {
      header: "Start Date",
      accessor: (row: ProjectRow) =>
        row.startDate ? new Date(row.startDate).toLocaleDateString() : "N/A",
    },
    {
      header: "Actions",
      accessor: (row: ProjectRow) => (
        <Link href={`/projects/${row.id}`}>
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
        title="Projects"
        description="Track and manage all IT service projects."
        action={
          <Link href="/projects/new">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </Link>
        }
      />

      {activeBusiness === "ramesys" ? (
        <>
          <TableControls
            onSearch={setSearch}
            searchValue={search}
            placeholder="Search projects..."
          >
            <select
              className={selectClass}
              value={filters.status ?? "all"}
              onChange={(e) => setFilter("status", e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
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
        </>
      ) : (
        <div className="p-10 text-center text-muted-foreground border rounded-xl border-dashed bg-muted/20 text-sm">
          Switch to Ramesys to view Projects.
        </div>
      )}
    </div>
  );
}
