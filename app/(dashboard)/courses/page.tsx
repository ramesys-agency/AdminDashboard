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
  
  // Query state
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
    } catch (err) {
      console.error("Failed to fetch courses:", err);
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
    { header: "Course Name", accessor: "name" as const },
    { header: "Price", accessor: (row: CourseRow) => `₹${row.price.toLocaleString()}` },
    { header: "Enrollments", accessor: (row: CourseRow) => row._count?.enrollments || 0 },
    { header: "Created At", accessor: (row: CourseRow) => new Date(row.createdAt).toLocaleDateString() },
    { 
      header: "Actions", 
      accessor: (row: CourseRow) => (
        <Link href={`/courses/${row.id}`}>
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
        title="Courses"
        description="Browse and manage all available courses."
        action={
          <Link href="/courses/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </Link>
        }
      />

      {activeBusiness === "vydhra" && (
        <TableControls 
          onSearch={handleSearch} 
          searchValue={search}
          placeholder="Search courses..."
        />
      )}
      
      {activeBusiness === "vydhra" ? (
        loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse border rounded-xl">Loading courses...</div>
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
          Switch to Vydhra to view Courses.
        </div>
      )}
    </div>
  );
}
