"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Loader2,
  CreditCard,
  Download,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
} from "lucide-react";

type InvoiceDetail = {
  id: string;
  amount: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
  business: {
    name: string;
    type: "IT_SERVICES" | "COURSE_SELLING";
  };
  project?: {
    id: string;
    name: string;
    client: { name: string; email: string; company: string | null };
  } | null;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    method: string | null;
    student?: { name: string; email: string } | null;
    courseEnrollment?: {
      id: string;
      course: { name: string };
    } | null;
  }>;
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      // Try fetching from the vydhra endpoint first (standard for this portal)
      apiClient
        .get<InvoiceDetail>(`/vydhra/invoices/${id}`)
        .then(setInvoice)
        .catch(() => {
          // Fallback to ramesys if vydhra fails
          return apiClient
            .get<InvoiceDetail>(`/ramesys/invoices/${id}`)
            .then(setInvoice);
        })
        .catch((err) => {
          console.error("Failed to fetch invoice:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDownloadPDF = () => {
    window.print();
  };

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

  const isPaid = invoice.status === "PAID";
  const isPending = invoice.status === "PENDING";
  const isOverdue =
    isPending && invoice.dueDate && new Date(invoice.dueDate) < new Date();
  const isVydhra = invoice.business.type === "COURSE_SELLING";

  // Determine dynamic billing info
  const clientName = isVydhra
    ? invoice.payments[0]?.student?.name || "N/A"
    : invoice.project?.client.name || "N/A";

  const clientEmail = isVydhra
    ? invoice.payments[0]?.student?.email || "No email recorded"
    : invoice.project?.client.email || "No email recorded";

  const description = isVydhra
    ? invoice.payments[0]?.courseEnrollment?.course.name || "Course Fees"
    : invoice.project?.name || "Service Charges";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 print:max-w-none print:p-0 print:m-0">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 border border-slate-200 text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Details</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          {!isPaid && (
            <Button
              size="sm"
              className="flex items-center gap-2 bg-slate-900 border-none transition-all hover:bg-slate-800"
            >
              <Send className="h-4 w-4" />
              Send to Client
            </Button>
          )}
        </div>
      </div>

      {/* Main Invoice Document */}
      <Card className="border shadow-2xl overflow-hidden bg-white print:shadow-none print:border-none">
        {/* Invoice Header */}
        <div className="p-12 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-start gap-8 print:bg-white print:p-8">
          <div className="space-y-4">
            <div className="h-12 w-auto flex items-center gap-2 text-slate-900 font-black text-2xl tracking-tighter">
              <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white print:bg-black">
                <FileText className="h-6 w-6" />
              </div>
              {invoice.business.name.toUpperCase()}
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                Billing From
              </p>
              <p className="text-sm font-bold">{invoice.business.name} Inc.</p>
              <p className="text-xs text-muted-foreground">
                {isVydhra
                  ? "123 Education Square, Learning Hub"
                  : "456 Tech Avenue, Innovation Block"}
                <br />
                Mumbai, MH 400001
              </p>
            </div>
          </div>

          <div className="text-left md:text-right space-y-4">
            <div className="space-y-1">
              <h2 className="text-4xl font-black text-slate-900 uppercase">
                INVOICE
              </h2>
              <p className="text-xs font-mono text-muted-foreground font-bold">
                #{invoice.id.toUpperCase()}
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-1">
              <Badge
                className={
                  isPaid
                    ? "bg-emerald-500 hover:bg-emerald-500"
                    : isOverdue
                      ? "bg-rose-500 hover:bg-rose-500"
                      : "bg-amber-500 hover:bg-amber-500"
                }
              >
                {isPaid
                  ? "PAID IN FULL"
                  : isOverdue
                    ? "OVERDUE"
                    : "PAYMENT PENDING"}
              </Badge>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                Generated: {new Date(invoice.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Billing Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 p-12 gap-12 bg-white print:p-8 print:gap-4">
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
              Bill To
            </p>
            <p className="text-lg font-bold text-slate-900 leading-tight">
              {clientName}
            </p>
            <p className="text-sm text-slate-600">
              {!isVydhra && invoice.project?.client.company && (
                <>
                  {invoice.project.client.company}
                  <br />
                </>
              )}
              {clientEmail}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:text-right print:gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                {isVydhra ? "Enrollment ID" : "Project ID"}
              </p>
              <p className="text-sm font-bold text-slate-900">
                {isVydhra
                  ? invoice.payments[0]?.courseEnrollment?.id || "N/A"
                  : invoice.project?.id || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                Due Date
              </p>
              <p className="text-sm font-bold text-slate-900">
                {invoice.dueDate
                  ? new Date(invoice.dueDate).toLocaleDateString()
                  : "Upon Receipt"}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="px-12 pb-12 print:px-8 print:pb-8">
          <div className="border rounded-2xl overflow-hidden print:border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 print:bg-slate-100">
                  <TableHead className="px-6 py-4 font-bold text-slate-900 uppercase text-[10px] tracking-widest">
                    Description
                  </TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-900 uppercase text-[10px] tracking-widest text-center">
                    Qty
                  </TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-900 uppercase text-[10px] tracking-widest text-right">
                    Unit Price
                  </TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-900 uppercase text-[10px] tracking-widest text-right">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b transition-none">
                  <TableCell className="px-6 py-8 print:py-4">
                    <p className="font-bold text-slate-900">{description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isVydhra
                        ? "Course enrollment and platform access fees."
                        : "Professional IT services as per agreement."}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-8 text-center font-bold text-slate-600 print:py-4">
                    1
                  </TableCell>
                  <TableCell className="px-6 py-8 text-right font-bold text-slate-600 print:py-4">
                    ${invoice.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-6 py-8 text-right font-black text-slate-900 print:py-4">
                    ${invoice.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Totals Section */}
            <div className="flex flex-col items-end p-8 bg-slate-50/30 gap-4 print:bg-transparent print:p-4">
              <div className="w-full md:w-1/2 space-y-3">
                <div className="flex justify-between text-sm text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span>${invoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 font-medium pb-4 border-b">
                  <span>Tax (0.00%)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900 pt-2 print:text-lg">
                  <span>Total Amount</span>
                  <span>${invoice.amount.toLocaleString()}</span>
                </div>

                {isPaid ? (
                  <div className="mt-6 flex items-center justify-center gap-2 p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 font-bold text-[10px] uppercase tracking-widest print:border-none print:px-0 print:justify-end">
                    <CheckCircle2 className="h-3 w-3" />
                    Fully Paid - No Balance Due
                  </div>
                ) : (
                  <div className="mt-6 flex items-center justify-center gap-2 p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 font-bold text-[10px] uppercase tracking-widest print:border-none print:px-0 print:justify-end">
                    <AlertCircle className="h-3 w-3" />
                    Balance Due - Urgent Payment Required
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest print:mt-12">
            This is a computer generated document. No signature required.
          </div>
        </div>
      </Card>

      {/* Linked Payments Tabs */}
      <Tabs defaultValue="payments" className="w-full print:hidden">
        <TabsList className="grid w-48 text-left mb-4 shadow-none bg-transparent h-auto">
          <TabsTrigger
            value="payments"
            className="justify-start px-0 font-black text-xs uppercase tracking-widest border-b-2 data-[state=active]:border-slate-900 rounded-none bg-transparent"
          >
            Payment History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="payments" className="mt-0">
          <Card className="border shadow-none overflow-hidden bg-white/50 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">
                    Ref ID
                  </TableHead>
                  <TableHead className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">
                    Amount
                  </TableHead>
                  <TableHead className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">
                    Method
                  </TableHead>
                  <TableHead className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-right">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-muted-foreground italic"
                    >
                      No payments recorded for this invoice yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoice.payments.map((p) => (
                    <TableRow
                      key={p.id}
                      className="hover:bg-slate-50/50 border-b"
                    >
                      <TableCell className="px-6 py-4 font-mono text-xs">
                        {p.id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-bold text-slate-900">
                        ${p.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <CreditCard className="h-3 w-3" />
                          {p.method?.replace("_", " ") || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge
                          variant={
                            p.status === "COMPLETED" ? "default" : "outline"
                          }
                          className={
                            p.status === "COMPLETED"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right text-slate-500 font-medium">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Global CSS for Print */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: auto;
            margin: 15mm;
          }
          header,
          footer,
          aside,
          nav,
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
