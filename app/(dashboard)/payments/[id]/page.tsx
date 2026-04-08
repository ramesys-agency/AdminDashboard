import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPaymentById } from "@/app/actions/ramesys";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ id: string }> };

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b last:border-0">
      <span className="text-xs font-semibold text-muted-foreground uppercase w-40 shrink-0">{label}</span>
      <span className="text-sm mt-1 sm:mt-0">{value ?? "N/A"}</span>
    </div>
  );
}

export default async function PaymentDetailPage({ params }: Props) {
  const { id } = await params;
  const payment = await getPaymentById(id);

  if (!payment) return notFound();

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
