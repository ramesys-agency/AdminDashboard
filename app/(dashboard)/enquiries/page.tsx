"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { useBusiness } from "@/context/BusinessContext";
import { getEnquiries } from "@/app/actions/ramesys";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

type EnquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  createdAt: Date;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    RESOLVED: "default",
    CONTACTED: "secondary",
    NEW: "outline",
  };
  return <Badge variant={map[status] ?? "outline"}>{status}</Badge>;
}

export default function EnquiriesPage() {
  const { activeBusiness } = useBusiness();
  const [data, setData] = useState<EnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeBusiness === "ramesys") {
      setLoading(true);
      getEnquiries()
        .then((d) => setData(d as EnquiryRow[]))
        .finally(() => setLoading(false));
    }
  }, [activeBusiness]);

  const columns = [
    { header: "ID", accessor: (row: EnquiryRow) => row.id.slice(-6).toUpperCase() },
    { header: "Name", accessor: "name" as const },
    { header: "Email", accessor: "email" as const },
    { header: "Phone", accessor: (row: EnquiryRow) => row.phone || "N/A" },
    { header: "Status", accessor: (row: EnquiryRow) => <StatusBadge status={row.status} /> },
    { header: "Received", accessor: (row: EnquiryRow) => new Date(row.createdAt).toLocaleDateString() },
    {
      header: "Actions",
      accessor: (row: EnquiryRow) => (
        <Link href={`/enquiries/${row.id}`}>
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
        title="Enquiries"
        description="View and manage all incoming client enquiries."
      />

      {activeBusiness === "ramesys" ? (
        loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse border rounded-xl">Loading enquiries...</div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            keyExtractor={(row) => row.id}
          />
        )
      ) : (
        <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed bg-muted/20">
          Switch to Ramesys to view Enquiries.
        </div>
      )}
    </div>
  );
}
