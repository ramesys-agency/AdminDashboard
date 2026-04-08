"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

type InvoiceDetail = {
  id: string;
  amount: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
  invoiceLink: string | null;
  project: { id: string; name: string; status: string } | null;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    method: string | null;
    createdAt: string;
  }>;
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      apiClient.get<InvoiceDetail>(`/ramesys/invoices/${id}`)
        .then(setInvoice)
        .catch((err) => console.error("Failed to fetch invoice:", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20 border rounded-xl border-dashed">
        <p className="text-muted-foreground">Invoice not found.</p>
        <Link href="/invoices" className="mt-4 inline-block">
          <Button variant="outline">Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PAID: "default",
    PENDING: "outline",
    CANCELLED: "destructive",
  };

  const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = invoice.amount - totalPaid;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title={`Invoice #${invoice.id.slice(-8).toUpperCase()}`}
        description="Invoice detail view"
        action={
          <Link href="/invoices">
            <Button variant="outline" size="sm">← Back to Invoices</Button>
          </Link>
        }
      />

      {/* Invoice Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">Status</p>
            <Badge variant={statusVariants[invoice.status] ?? "outline"}>{invoice.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">Invoice Amount</p>
            <p className="text-sm font-bold">₹{invoice.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">Due Date</p>
            <p className="text-sm font-medium">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">Created</p>
            <p className="text-sm font-medium">{new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>
          {invoice.invoiceLink && (
            <div className="col-span-2 md:col-span-4">
              <p className="text-xs text-muted-foreground uppercase mb-1">Invoice Link</p>
              <a href={invoice.invoiceLink} target="_blank" rel="noopener noreferrer" className="text-primary text-sm underline break-all">{invoice.invoiceLink}</a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project link */}
      {invoice.project && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Associated Project</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium">{invoice.project.name}</p>
              <p className="text-xs text-muted-foreground">{invoice.project.status}</p>
            </div>
            <Link href={`/projects/${invoice.project.id}`}>
              <Button variant="outline" size="sm">View Project</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Payment Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Invoice Total", value: `₹${invoice.amount.toLocaleString()}` },
          { label: "Total Paid", value: `₹${totalPaid.toLocaleString()}` },
          { label: "Outstanding", value: `₹${outstanding.toLocaleString()}` },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payments for this Invoice</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.payments.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No payments linked to this invoice.</TableCell></TableRow>
              ) : invoice.payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs text-muted-foreground">{p.id.slice(-6).toUpperCase()}</TableCell>
                  <TableCell className="font-medium">₹{p.amount.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                  <TableCell>{p.method || "N/A"}</TableCell>
                  <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Link href={`/payments/${p.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
