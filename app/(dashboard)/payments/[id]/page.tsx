"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type PaymentDetail = {
  id: string;
  amount: number;
  status: string;
  method: string | null;
  createdAt: string;
  project: { id: string; name: string } | null;
  invoice: { id: string } | null;
  student: { name: string } | null;
  agent: { name: string; code: string } | null;
  coupon: { code: string; discountPercent: number } | null;
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b last:border-0">
      <span className="text-xs font-semibold text-muted-foreground uppercase w-40 shrink-0">{label}</span>
      <span className="text-sm mt-1 sm:mt-0">{value ?? "N/A"}</span>
    </div>
  );
}

export default function PaymentDetailPage() {
  const { id } = useParams();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      apiClient.get<PaymentDetail>(`/ramesys/payments/${id}`)
        .then(setPayment)
        .catch((err) => console.error("Failed to fetch payment:", err))
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

  if (!payment) {
    return (
      <div className="text-center py-20 border rounded-xl border-dashed">
        <p className="text-muted-foreground">Payment not found.</p>
        <Link href="/payments" className="mt-4 inline-block">
          <Button variant="outline">Back to Payments</Button>
        </Link>
      </div>
    );
  }

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    COMPLETED: "default",
    PENDING: "outline",
    FAILED: "destructive",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="Payment Details"
        description={`ID: ${payment.id.slice(-8).toUpperCase()}`}
        action={
          <Link href="/payments">
            <Button variant="outline" size="sm">← Back to Payments</Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailRow label="Transaction ID" value={<code className="text-xs bg-muted px-2 py-1 rounded">{payment.id}</code>} />
          <DetailRow label="Amount" value={<span className="text-lg font-bold">₹{payment.amount.toLocaleString()}</span>} />
          <DetailRow label="Status" value={<Badge variant={statusVariants[payment.status] ?? "outline"}>{payment.status}</Badge>} />
          <DetailRow label="Method" value={payment.method} />
          <DetailRow label="Date" value={new Date(payment.createdAt).toLocaleString()} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Relations</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailRow
            label="Project"
            value={payment.project ? (
              <Link href={`/projects/${payment.project.id}`} className="text-primary hover:underline">
                {payment.project.name}
              </Link>
            ) : "N/A"}
          />
          <DetailRow
            label="Invoice"
            value={payment.invoice ? (
              <Link href={`/invoices/${payment.invoice.id}`} className="text-primary hover:underline">
                Invoice #{payment.invoice.id.slice(-6).toUpperCase()}
              </Link>
            ) : "N/A"}
          />
          <DetailRow
            label="Student"
            value={payment.student?.name || null}
          />
          <DetailRow
            label="Agent"
            value={payment.agent ? `${payment.agent.name} (${payment.agent.code})` : null}
          />
          <DetailRow
            label="Coupon"
            value={payment.coupon ? `${payment.coupon.code} — ${payment.coupon.discountPercent}% off` : null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
