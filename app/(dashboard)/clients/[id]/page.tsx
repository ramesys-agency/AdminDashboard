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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Loader2, ArrowLeft } from "lucide-react";

type ClientDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  createdAt: string;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    budget: number | null;
    startDate: string | null;
    payments: Array<{
      id: string;
      amount: number;
      status: string;
      createdAt: string;
    }>;
    invoices: Array<{
      id: string;
      amount: number;
      status: string;
      dueDate: string | null;
    }>;
  }>;
};

export default function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      apiClient
        .get<ClientDetail>(`/ramesys/clients/${id}`)
        .then(setClient)
        .catch((err) => {
          console.error("Failed to fetch client:", err);
        })
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

  if (!client) {
    return (
      <div className="text-center py-20 border rounded-xl border-dashed">
        <p className="text-muted-foreground">Client not found.</p>
        <Link href="/clients" className="mt-4 inline-block">
          <Button variant="outline">Back to Clients</Button>
        </Link>
      </div>
    );
  }

  const totalBudget = client.projects.reduce(
    (sum, p) => sum + (p.budget ?? 0),
    0,
  );
  const totalPaid = client.projects
    .flatMap((p) => p.payments)
    .reduce((sum, pay) => sum + pay.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <PageHeader
        title={client.name}
        description="Client detail view"
        action={
          <Link href="/clients">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Clients
            </Button>
          </Link>
        }
      />

      {/* Client Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">
              Email
            </p>
            <p className="text-sm font-medium">{client.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">
              Phone
            </p>
            <p className="text-sm font-medium">{client.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">
              Company
            </p>
            <p className="text-sm font-medium">{client.company || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1">
              Member Since
            </p>
            <p className="text-sm font-medium">
              {new Date(client.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: client.projects.length },
          { label: "Total Budget", value: `$${totalBudget.toLocaleString()}` },
          { label: "Total Paid", value: `$${totalPaid.toLocaleString()}` },
          {
            label: "Outstanding",
            value: `$${(totalBudget - totalPaid).toLocaleString()}`,
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase">
                {s.label}
              </p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projects</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 border-b hover:bg-slate-50/80">
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  Name
                </TableHead>
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  Budget
                </TableHead>
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  Start Date
                </TableHead>
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {client.projects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No projects found.
                  </TableCell>
                </TableRow>
              ) : (
                client.projects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium px-6 py-4 text-slate-900">
                      {project.name}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant="outline">{project.status}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {project.budget
                        ? `$${project.budget.toLocaleString()}`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {project.startDate
                        ? new Date(project.startDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Link href={`/projects/${project.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 border-b hover:bg-slate-50/80">
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  ID
                </TableHead>
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  Amount
                </TableHead>
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  Project
                </TableHead>
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {client.projects.flatMap((p) => p.payments).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                client.projects
                  .flatMap((p) =>
                    p.payments.map((pay) => ({ ...pay, projectName: p.name })),
                  )
                  .map((pay) => (
                    <TableRow key={pay.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs text-muted-foreground px-6 py-4">
                        {pay.id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium px-6 py-4 text-slate-900">
                        ${pay.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="outline">{pay.status}</Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {pay.projectName}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {new Date(pay.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 border-b hover:bg-slate-50/80">
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  ID
                </TableHead>
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  Amount
                </TableHead>
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  Due Date
                </TableHead>
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  Project
                </TableHead>
                <TableHead className="px-6 py-3 font-semibold text-slate-900 uppercase text-xs tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {client.projects.flatMap((p) => p.invoices).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                client.projects
                  .flatMap((p) =>
                    p.invoices.map((inv) => ({ ...inv, projectName: p.name })),
                  )
                  .map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs text-muted-foreground px-6 py-4">
                        {inv.id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium px-6 py-4 text-slate-900">
                        ${inv.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="outline">{inv.status}</Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {inv.dueDate
                          ? new Date(inv.dueDate).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {inv.projectName}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Link href={`/invoices/${inv.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
