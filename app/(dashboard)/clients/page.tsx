"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { useBusiness } from "@/context/BusinessContext";
import { getClients } from "@/app/actions/ramesys";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

type ClientRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  _count: { projects: number };
  createdAt: Date;
};

export default function ClientsPage() {
  const { activeBusiness } = useBusiness();
  const [data, setData] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeBusiness === "ramesys") {
      setLoading(true);
      getClients()
        .then((d) => setData(d as ClientRow[]))
        .finally(() => setLoading(false));
    }
  }, [activeBusiness]);

  const columns = [
    { header: "ID", accessor: (row: ClientRow) => row.id.slice(-6).toUpperCase() },
    { header: "Client Name", accessor: "name" as const },
    { header: "Email", accessor: "email" as const },
    { header: "Company", accessor: (row: ClientRow) => row.company || "N/A" },
    { header: "Projects Count", accessor: (row: ClientRow) => row._count?.projects || 0 },
    { 
      header: "Actions", 
      accessor: (row: ClientRow) => (
        <Link href={`/clients/${row.id}`}>
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
        title="Clients"
        description="Manage your IT client portfolio and contacts."
      />
      
      {activeBusiness === "ramesys" ? (
        loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse border rounded-xl">Loading clients...</div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            keyExtractor={(row) => row.id}
          />
        )
      ) : (
        <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed bg-muted/20">
          Switch to Ramesys to view Clients.
        </div>
      )}
    </div>
  );
}
