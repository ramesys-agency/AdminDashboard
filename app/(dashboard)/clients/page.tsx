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

type ClientRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  _count: { projects: number };
  createdAt: string;
};

export default function ClientsPage() {
  const { activeBusiness } = useBusiness();
  const { data, metadata, loading, refreshing, setPage, search, setSearch } =
    usePaginatedList<ClientRow>(
      activeBusiness === "ramesys" ? "/ramesys/clients" : null,
      { errorMessage: "Failed to load clients. Please try again." }
    );

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Client Name", accessor: "name" as const },
    { header: "Email", accessor: "email" as const },
    { header: "Company", accessor: (row: ClientRow) => row.company || "N/A" },
    { header: "Projects", accessor: (row: ClientRow) => row._count?.projects || 0 },
    {
      header: "Actions",
      accessor: (row: ClientRow) => (
        <Link href={`/clients/${row.id}`}>
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
        title="Clients"
        description="Manage your IT client portfolio and contacts."
        action={
          <Link href="/clients/new">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </Link>
        }
      />

      {activeBusiness === "ramesys" ? (
        <>
          <TableControls
            onSearch={setSearch}
            searchValue={search}
            placeholder="Search by name, email or company..."
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
          Switch to Ramesys to view Clients.
        </div>
      )}
    </div>
  );
}
