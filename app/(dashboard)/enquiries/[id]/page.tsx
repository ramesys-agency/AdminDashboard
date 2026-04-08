import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEnquiryById } from "@/app/actions/ramesys";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ id: string }> };

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b last:border-0 gap-1">
      <span className="text-xs font-semibold text-muted-foreground uppercase w-40 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm flex-1">{value ?? <span className="text-muted-foreground">N/A</span>}</span>
    </div>
  );
}

export default async function EnquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const enquiry = await getEnquiryById(id);

  if (!enquiry) return notFound();

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    RESOLVED: "default",
    CONTACTED: "secondary",
    NEW: "outline",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="Enquiry Details"
        description={`From: ${enquiry.name}`}
        action={
          <Link href="/enquiries">
            <Button variant="outline" size="sm">← Back to Enquiries</Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Enquiry Information</CardTitle>
            <Badge variant={statusVariants[enquiry.status] ?? "outline"}>{enquiry.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <DetailRow label="Transaction ID" value={<code className="text-xs bg-muted px-2 py-1 rounded">{enquiry.id}</code>} />
          <DetailRow label="Name" value={enquiry.name} />
          <DetailRow label="Email" value={<a href={`mailto:${enquiry.email}`} className="text-primary hover:underline">{enquiry.email}</a>} />
          <DetailRow label="Phone" value={enquiry.phone ? <a href={`tel:${enquiry.phone}`} className="text-primary hover:underline">{enquiry.phone}</a> : null} />
          <DetailRow label="Status" value={<Badge variant={statusVariants[enquiry.status] ?? "outline"}>{enquiry.status}</Badge>} />
          <DetailRow label="Received On" value={new Date(enquiry.createdAt).toLocaleString()} />
        </CardContent>
      </Card>

      {enquiry.message && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Message</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{enquiry.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
