"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { useBusiness } from "@/context/BusinessContext";
import { getPayments } from "@/app/actions/ramesys";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

type PaymentRow = {
  id: string;
  amount: number;
  status: string;
  method: string | null;
  project: { id: string; name: string } | null;
  invoice: { id: string } | null;
  createdAt: Date;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    COMPLETED: "default",
    PENDING: "outline",
    FAILED: "destructive",
  };
  return <Badge variant={map[status] ?? "outline"}>{status}</Badge>;
}

export default function PaymentsPage() {
  const { activeBusiness } = useBusiness();
  const [data, setData] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeBusiness === "ramesys") {
      setLoading(true);
      getPayments()
        .then((d) => setData(d as PaymentRow[]))
        .finally(() => setLoading(false));
    }
  }, [activeBusiness]);

  const columns = [
    { header: "ID", accessor: (row: PaymentRow) => row.id.slice(-6).toUpperCase() },
    { header: "Amount", accessor: (row: PaymentRow) => `₹${row.amount.toLocaleString()}` },
    { header: "Status", accessor: (row: PaymentRow) => <StatusBadge status={row.status} /> },
    { header: "Method", accessor: (row: PaymentRow) => row.method || "N/A" },
    { header: "Project", accessor: (row: PaymentRow) => row.project?.name || "N/A" },
    { header: "Date", accessor: (row: PaymentRow) => new Date(row.createdAt).toLocaleDateString() },
    {
      header: "Actions",
      accessor: (row: PaymentRow) => (
        <Link href={`/payments/${row.id}`}>
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
        title="Payments"
        description="Monitor all financial transactions and payment statuses."
      />

      {activeBusiness === "ramesys" ? (
        loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse border rounded-xl">Loading payments...</div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            keyExtractor={(row) => row.id}
          />
        )
      ) : (
        <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed bg-muted/20">
          Switch to Ramesys to view Payments.
        </div>
      )}
    </div>
  );
}
