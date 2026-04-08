"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { useBusiness } from "@/context/BusinessContext";
import { getInvoices } from "@/app/actions/ramesys";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

type InvoiceRow = {
  id: string;
  amount: number;
  status: string;
  dueDate: Date | null;
  invoiceLink: string | null;
  project: { id: string; name: string } | null;
  createdAt: Date;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PAID: "default",
    PENDING: "outline",
    CANCELLED: "destructive",
  };
  return <Badge variant={map[status] ?? "outline"}>{status}</Badge>;
}

export default function InvoicesPage() {
  const { activeBusiness } = useBusiness();
  const [data, setData] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeBusiness === "ramesys") {
      setLoading(true);
      getInvoices()
        .then((d) => setData(d as InvoiceRow[]))
        .finally(() => setLoading(false));
    }
  }, [activeBusiness]);

  const columns = [
    { header: "ID", accessor: (row: InvoiceRow) => row.id.slice(-6).toUpperCase() },
    { header: "Amount", accessor: (row: InvoiceRow) => `₹${row.amount.toLocaleString()}` },
    { header: "Status", accessor: (row: InvoiceRow) => <StatusBadge status={row.status} /> },
    { header: "Project", accessor: (row: InvoiceRow) => row.project?.name || "N/A" },
    { header: "Due Date", accessor: (row: InvoiceRow) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "N/A" },
    { 
      header: "Invoice Link", 
      accessor: (row: InvoiceRow) => row.invoiceLink 
        ? <a href={row.invoiceLink} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs truncate max-w-[100px] block">View Link</a>
        : "N/A"
    },
    {
      header: "Actions",
      accessor: (row: InvoiceRow) => (
        <Link href={`/invoices/${row.id}`}>
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
        title="Invoices"
        description="Manage and track all client invoices."
      />

      {activeBusiness === "ramesys" ? (
        loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse border rounded-xl">Loading invoices...</div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            keyExtractor={(row) => row.id}
          />
        )
      ) : (
        <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed bg-muted/20">
          Switch to Ramesys to view Invoices.
        </div>
      )}
    </div>
  );
}
