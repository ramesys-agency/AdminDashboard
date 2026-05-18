"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { TableControls } from "@/components/common/TableControls";
import { useBusiness } from "@/context/BusinessContext";
import { apiClient, PaginatedResponse, PaginationMetadata } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

type CourseRow = {
  id: string;
  name: string;
  price: number;
  _count: { enrollments: number };
  createdAt: string;
};

export default function CoursesPage() {
  const { activeBusiness } = useBusiness();
  const [data, setData] = useState<CourseRow[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetadata | undefined>();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async (p: number, q: string) => {
    if (activeBusiness !== "vydhra") return;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: p.toString(),
        limit: "10",
        ...(q && { q }),
      });
      const res = await apiClient.get<PaginatedResponse<CourseRow>>(`/vydhra/courses?${query}`);
      setData(res.data);
      setMetadata(res.metadata);
    } catch {
      toast.error("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => {
    fetchData(page, search);
  }, [page, search, fetchData]);

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Course Name", accessor: "name" as const },
    { header: "Price", accessor: (row: CourseRow) => `$${row.price.toLocaleString()}` },
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

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

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
            onSearch={handleSearch}
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
