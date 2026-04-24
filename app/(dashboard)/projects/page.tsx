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
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    IN_PROGRESS: "default",
    COMPLETED: "secondary",
    PENDING: "outline",
  };
  return (
    <Badge variant={variants[status] ?? "outline"}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export default function ProjectsPage() {
  const { activeBusiness } = useBusiness();
  const [data, setData] = useState<ProjectRow[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetadata | undefined>();
  const [loading, setLoading] = useState(true);

  // Query state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(
    async (p: number, q: string, status: string) => {
      if (activeBusiness !== "ramesys") return;

      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: p.toString(),
          limit: "10",
          ...(q && { q }),
          ...(status !== "all" && { status }),
        });

        const res = await apiClient.get<PaginatedResponse<ProjectRow>>(
          `/ramesys/projects?${query}`,
        );
        setData(res.data);
        setMetadata(res.metadata);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    },
    [activeBusiness],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(page, search, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter, fetchData]);

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Project Name", accessor: "name" as const },
    {
      header: "Client",
      accessor: (row: ProjectRow) => row.client?.name || "N/A",
    },
    {
      header: "Budget",
      accessor: (row: ProjectRow) =>
        row.budget ? `$${row.budget.toLocaleString()}` : "N/A",
    },
    {
      header: "Status",
      accessor: (row: ProjectRow) => <StatusBadge status={row.status} />,
    },
    {
      header: "Start Date",
      accessor: (row: ProjectRow) =>
        row.startDate ? new Date(row.startDate).toLocaleDateString() : "N/A",
    },
    {
      header: "Actions",
      accessor: (row: ProjectRow) => (
        <Link href={`/projects/${row.id}`}>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
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
        title="Projects"
        description="Track and manage all IT service projects."
        action={
          <Link href="/projects/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </Link>
        }
      />

      {activeBusiness === "ramesys" && (
        <TableControls
          onSearch={handleSearch}
          searchValue={search}
          placeholder="Search projects..."
        >
          <select
            className="h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </TableControls>
      )}

      {activeBusiness === "ramesys" ? (
        loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse border rounded-xl">
            Loading projects...
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
          Switch to Ramesys to view Projects.
        </div>
      )}
    </div>
  );
}
