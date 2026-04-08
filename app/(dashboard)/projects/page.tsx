"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { useBusiness } from "@/context/BusinessContext";
import { getProjects } from "@/app/actions/ramesys";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

type ProjectRow = {
  id: string;
  name: string;
  status: string;
  budget: number | null;
  startDate: Date | null;
  endDate: Date | null;
  client: { id: string; name: string } | null;
};

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeBusiness === "ramesys") {
      setLoading(true);
      getProjects()
        .then((d) => setData(d as ProjectRow[]))
        .finally(() => setLoading(false));
    }
  }, [activeBusiness]);

  const columns = [
    { header: "ID", accessor: (row: ProjectRow) => row.id.slice(-6).toUpperCase() },
    { header: "Project Name", accessor: "name" as const },
    { header: "Client", accessor: (row: ProjectRow) => row.client?.name || "N/A" },
    { header: "Budget", accessor: (row: ProjectRow) => row.budget ? `₹${row.budget.toLocaleString()}` : "N/A" },
    { header: "Status", accessor: (row: ProjectRow) => <StatusBadge status={row.status} /> },
    { header: "Start Date", accessor: (row: ProjectRow) => row.startDate ? new Date(row.startDate).toLocaleDateString() : "N/A" },
    {
      header: "Actions",
      accessor: (row: ProjectRow) => (
        <Link href={`/projects/${row.id}`}>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      )
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Projects"
        description="Track and manage all IT service projects."
      />

      {activeBusiness === "ramesys" ? (
        loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse border rounded-xl">Loading projects...</div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            keyExtractor={(row) => row.id}
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
