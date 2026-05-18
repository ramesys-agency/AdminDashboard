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
import { toast } from "sonner";

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
  const [data, setData] = useState<ProjectRow[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetadata | undefined>();
  const [loading, setLoading] = useState(true);
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
      const res = await apiClient.get<PaginatedResponse<ProjectRow>>(`/ramesys/projects?${query}`);
      setData(res.data);
      setMetadata(res.metadata);
    } catch {
      toast.error("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => {
    fetchData(page, search, statusFilter);
  }, [page, search, statusFilter, fetchData]);

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
            onSearch={(val) => { setSearch(val); setPage(1); }}
            searchValue={search}
            placeholder="Search projects..."
          >
            <select
              className={selectClass}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
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
