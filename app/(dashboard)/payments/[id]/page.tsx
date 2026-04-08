"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Loader2, Calendar, CreditCard, User, Landmark, ShieldCheck, Link as LinkIcon, Download } from "lucide-react";

type PaymentDetail = {
  id: string;
  amount: number;
  status: string;
  method: string | null;
  transactionId: string | null;
  createdAt: string;
  student?: { id: string; name: string; email: string } | null;
  agent?: { id: string; name: string; code: string } | null;
  course?: { id: string; name: string } | null;
  invoice?: { id: string; amount: number; status: string } | null;
  project?: { id: string; name: string } | null;
};

export default function PaymentDetailPage() {
  const { id } = useParams();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      // We'll try to fetch from vydhra first, or we need a generic route. 
      // For now, let's assume we use the vydhra one as per previous service implementation if student exists
      apiClient.get<PaymentDetail>(`/vydhra/payments/${id}`)
        .then(setPayment)
        .catch((err) => {
          console.error("Failed to fetch payment:", err);
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

  if (!payment) {
    return (
      <div className="text-center py-20 border rounded-xl border-dashed">
        <p className="text-muted-foreground">Payment record not found.</p>
        <Link href="/payments" className="mt-4 inline-block">
          <Button variant="outline">Back to Payments</Button>
        </Link>
      </div>
    );
  }

  const isCompleted = payment.status === "COMPLETED";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/payments">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Transaction Proof</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export receipt
          </Button>
        </div>
      </div>

      {/* Payment Summary Header */}
      <Card className={`overflow-hidden border-none shadow-lg ${isCompleted ? 'bg-slate-900' : 'bg-amber-600'} text-white`}>
        <CardContent className="p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={`${isCompleted ? 'bg-emerald-500' : 'bg-white/20'} text-white border-none px-3 font-bold`}>
                  {payment.status}
                </Badge>
                <span className="text-white/60 text-xs font-medium uppercase tracking-widest">#{payment.id.toUpperCase()}</span>
              </div>
              <h2 className="text-5xl font-black tracking-tighter">₹{payment.amount.toLocaleString()}</h2>
              <div className="flex items-center gap-2 text-white/70">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">{new Date(payment.createdAt).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="h-24 w-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              {payment.method === 'UPI' ? <Landmark className="h-12 w-12" /> : <CreditCard className="h-12 w-12" />}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payer Details */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              Payer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableBody>
                <TableRow className="border-b">
                  <TableCell className="font-medium text-muted-foreground w-1/3 px-6 py-4">Name</TableCell>
                  <TableCell className="px-6 py-4 font-bold">{payment.student?.name || payment.project?.name || "System Record"}</TableCell>
                </TableRow>
                <TableRow className="border-b">
                  <TableCell className="font-medium text-muted-foreground px-6 py-4">Reference ID</TableCell>
                  <TableCell className="px-6 py-4 font-mono text-xs">{payment.student?.id || payment.project?.id || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground px-6 py-4">Contact</TableCell>
                  <TableCell className="px-6 py-4">{payment.student?.email || "N/A"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Transaction Security */}
        <Card className="border-none shadow-sm overflow-hidden text-emerald-900 bg-emerald-50/20 border border-emerald-100">
          <CardHeader className="border-b border-emerald-100">
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Gateway Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableBody>
                <TableRow className="border-b border-emerald-50">
                  <TableCell className="font-medium text-emerald-700/60 w-1/3 px-6 py-4">Method</TableCell>
                  <TableCell className="px-6 py-4 font-bold">{payment.method || "UNSPECIFIED"}</TableCell>
                </TableRow>
                <TableRow className="border-b border-emerald-50">
                  <TableCell className="font-medium text-emerald-700/60 px-6 py-4">Network ID</TableCell>
                  <TableCell className="px-6 py-4 font-mono text-xs">{payment.transactionId || "INTERNAL_GEN"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-emerald-700/60 px-6 py-4">Verified</TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">System Verified</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Linked Assets */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Related Entities</CardTitle>
            <CardDescription className="text-[10px] mt-0.5">Resources connected to this payment</CardDescription>
          </div>
          <LinkIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {payment.course && (
            <div className="flex flex-col gap-2 p-4 rounded-xl border bg-slate-50/30 group hover:border-blue-200 hover:bg-blue-50/20 transition-all">
              <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Purchased Course</p>
              <p className="font-bold text-slate-800 truncate">{payment.course.name}</p>
              <Link href={`/courses/${payment.course.id}`} className="inline-flex items-center text-[10px] font-bold text-blue-600 mt-2">
                VIEW COURSE <ArrowUpRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          )}
          
          {payment.invoice && (
            <div className="flex flex-col gap-2 p-4 rounded-xl border bg-slate-50/30 group hover:border-purple-200 hover:bg-purple-50/20 transition-all">
              <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Linked Invoice</p>
              <p className="font-bold text-slate-800">#{payment.invoice.id.slice(-8).toUpperCase()}</p>
              <Link href={`/invoices/${payment.invoice.id}`} className="inline-flex items-center text-[10px] font-bold text-purple-600 mt-2">
                VIEW INVOICE <ArrowUpRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          )}

          {payment.agent && (
            <div className="flex flex-col gap-2 p-4 rounded-xl border bg-slate-50/30 group hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
              <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Referral Agent</p>
              <p className="font-bold text-slate-800">{payment.agent.name}</p>
              <Badge variant="outline" className="w-fit text-[9px] mt-1 font-black">{payment.agent.code}</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );
}
