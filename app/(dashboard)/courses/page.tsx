"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { TableControls } from "@/components/common/TableControls";
import { useBusiness } from "@/context/BusinessContext";
import { usePaginatedList } from "@/lib/use-api";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Plus } from "lucide-react";

type CourseRow = {
  id: string;
  name: string;
  pricing: Record<string, number>;
  _count: { enrollments: number };
  createdAt: string;
};

export default function CoursesPage() {
  const { activeBusiness } = useBusiness();
  const { data, metadata, loading, refreshing, setPage, search, setSearch } =
    usePaginatedList<CourseRow>(
      activeBusiness === "vydhra" ? "/vydhra/courses" : null,
      { errorMessage: "Failed to load courses. Please try again." }
    );

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Course Name", accessor: "name" as const },
    { header: "Price (USD)", accessor: (row: CourseRow) => row.pricing?.USD != null ? `$${row.pricing.USD.toLocaleString()}` : "—" },
    { header: "Enrollments", accessor: (row: CourseRow) => row._count?.enrollments || 0 },
    { header: "Created At", accessor: (row: CourseRow) => new Date(row.createdAt).toLocaleDateString() },
    {
      header: "Actions",
      accessor: (row: CourseRow) => (
        <div className="flex items-center gap-1">
          <Link href={`/courses/${row.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-muted" title="View">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/courses/${row.id}/edit`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-muted" title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <PageHeader
        title="Courses"
        description="Browse and manage all available courses."
        action={
          <Link href="/courses/new">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </Link>
        }
      />

      {activeBusiness === "vydhra" ? (
        <>
          <TableControls
            onSearch={setSearch}
            searchValue={search}
            placeholder="Search courses..."
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
          Switch to Vydhra to view Courses.
        </div>
      )}
    </div>
  );
}
