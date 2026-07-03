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

type StudentRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  _count: { enrollments: number };
  createdAt: string;
};

export default function StudentsPage() {
  const { activeBusiness } = useBusiness();
  const { data, metadata, loading, refreshing, setPage, search, setSearch } =
    usePaginatedList<StudentRow>(
      activeBusiness === "vydhra" ? "/vydhra/students" : null,
      { errorMessage: "Failed to load students. Please try again." }
    );

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Name", accessor: "name" as const },
    { header: "Email", accessor: "email" as const },
    { header: "Enrollments", accessor: (row: StudentRow) => row._count?.enrollments || 0 },
    { header: "Joined", accessor: (row: StudentRow) => new Date(row.createdAt).toLocaleDateString() },
    {
      header: "Actions",
      accessor: (row: StudentRow) => (
        <Link href={`/students/${row.id}`}>
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
        title="Students"
        description="Manage all enrolled students on the platform."
        action={
          <Link href="/students/new">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </Link>
        }
      />

      {activeBusiness === "vydhra" ? (
        <>
          <TableControls
            onSearch={setSearch}
            searchValue={search}
            placeholder="Search students..."
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
          Switch to Vydhra to view Students.
        </div>
      )}
    </div>
  );
}
