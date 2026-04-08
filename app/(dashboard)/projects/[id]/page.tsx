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
import { Loader2, ArrowLeft } from "lucide-react";

type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  client: { id: string; name: string };
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    method: string | null;
    createdAt: string;
  }>;
  invoices: Array<{
    id: string;
    amount: number;
    status: string;
    dueDate: string | null;
    invoiceLink: string | null;
  }>;
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      apiClient.get<ProjectDetail>(`/ramesys/projects/${id}`)
        .then(setProject)
        .catch((err) => console.error("Failed to fetch project:", err))
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

  if (!project) {
    return (
      <div className="text-center py-20 border rounded-xl border-dashed">
        <p className="text-muted-foreground">Project not found.</p>
        <Link href="/projects" className="mt-4 inline-block">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  const totalPaid = project.payments.reduce((s, p) => s + p.amount, 0);
  const invoicesTotal = project.invoices.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <PageHeader
        title={project.name}
        description="Project detail view"
        action={
          <Link href="/projects">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        }
      />

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">Client</p>
            <Link href={`/clients/${project.client.id}`} className="text-sm font-medium text-primary hover:underline">{project.client.name}</Link>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">Status</p>
            <Badge variant="outline">{project.status.replace("_", " ")}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">Budget</p>
            <p className="text-sm font-medium">{project.budget ? `₹${project.budget.toLocaleString()}` : "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">Timeline</p>
            <p className="text-sm font-medium">
              {project.startDate ? new Date(project.startDate).toLocaleDateString() : "?"} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Ongoing"}
            </p>
          </div>
          {project.description && (
            <div className="col-span-2 md:col-span-4">
              <p className="text-xs text-muted-foreground uppercase mb-1">Description</p>
              <p className="text-sm">{project.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Budget", value: project.budget ? `₹${project.budget.toLocaleString()}` : "N/A" },
          { label: "Total Paid", value: `₹${totalPaid.toLocaleString()}` },
          { label: "Invoiced", value: `₹${invoicesTotal.toLocaleString()}` },
          { label: "Remaining", value: `₹${((project.budget ?? 0) - totalPaid).toLocaleString()}` },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payments</CardTitle>
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
              {project.payments.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No payments found.</TableCell></TableRow>
              ) : project.payments.map((p) => (
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

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.invoices.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No invoices found.</TableCell></TableRow>
              ) : project.invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="text-xs text-muted-foreground">{inv.id.slice(-6).toUpperCase()}</TableCell>
                  <TableCell className="font-medium">₹{inv.amount.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline">{inv.status}</Badge></TableCell>
                  <TableCell>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell>
                    {inv.invoiceLink ? (
                      <a href={inv.invoiceLink} target="_blank" rel="noopener noreferrer" className="text-primary text-xs underline">Open</a>
                    ) : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/invoices/${inv.id}`}>
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
