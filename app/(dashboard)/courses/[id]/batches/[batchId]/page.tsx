"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Loader2, Calendar, Users, DollarSign,
  Clock, Layers, Eye, MessageCircle,
} from "lucide-react";

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", INR: "₹", EUR: "€", GBP: "£", AED: "د.إ" };
const sym = (currency: string) => CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency;

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const ENROLL_STATUS_COLORS: Record<string, string> = {
  ENROLLED: "bg-blue-100 text-blue-700",
  PAID: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700",
};

type BatchDetail = {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  maxSeats: number | null;
  whatsappGroupUrl: string | null;
  pricing: Record<string, number>;
  originalPricing?: Record<string, number>;
  course: { id: string; name: string; slug: string };
  enrollments: Array<{
    id: string;
    status: string;
    createdAt: string;
    student: { id: string; name: string; email: string; phone: string | null; country: string | null };
    payments: Array<{ id: string; amount: number; currency: string; status: string; method: string | null; createdAt: string }>;
  }>;
  stats: {
    totalEnrolled: number;
    seatsLeft: number | null;
    earningsByCurrency: Record<string, number>;
    durationDays: number;
  };
};

export default function BatchDetailPage() {
  const { id, batchId } = useParams();
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (batchId) {
      apiClient
        .get<BatchDetail>(`/vydhra/batches/${batchId}`)
        .then(setBatch)
        .catch(() => toast.error("Failed to load batch details."))
        .finally(() => setLoading(false));
    }
  }, [batchId]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center py-20 border rounded-xl border-dashed">
        <p className="text-muted-foreground">Batch not found.</p>
        <Link href={`/courses/${id}`}>
          <Button variant="outline" className="mt-4">Back to Course</Button>
        </Link>
      </div>
    );
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  const weeks = Math.round(batch.stats.durationDays / 7);

  const earningsEntries = Object.entries(batch.stats.earningsByCurrency);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/courses/${id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              <Link href={`/courses/${id}`} className="hover:text-primary">{batch.course.name}</Link>
              {" / Batches"}
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{batch.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {batch.whatsappGroupUrl && (
            <a href={batch.whatsappGroupUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                <MessageCircle className="h-4 w-4" />
                WhatsApp Group
              </Button>
            </a>
          )}
          <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full ${STATUS_COLORS[batch.status] ?? "bg-slate-100 text-slate-700"}`}>
            {batch.status}
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm pb-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Users className="h-4 w-4" /></div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Enrolled</p>
            </div>
            <p className="text-3xl font-black ml-1">{batch.stats.totalEnrolled}</p>
            {batch.maxSeats != null && (
              <p className="text-xs text-muted-foreground ml-1 mt-1">
                of {batch.maxSeats} seats
                {batch.stats.seatsLeft != null && (
                  <span className={`ml-1 font-semibold ${batch.stats.seatsLeft === 0 ? "text-red-500" : "text-emerald-600"}`}>
                    ({batch.stats.seatsLeft === 0 ? "Full" : `${batch.stats.seatsLeft} left`})
                  </span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm pb-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><DollarSign className="h-4 w-4" /></div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Total Earnings</p>
            </div>
            {earningsEntries.length > 0 ? (
              earningsEntries.map(([currency, amount]) => (
                <p key={currency} className="text-2xl font-black ml-1 text-emerald-700">
                  {sym(currency)}{amount.toLocaleString()}
                </p>
              ))
            ) : (
              <p className="text-2xl font-black ml-1 text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm pb-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Clock className="h-4 w-4" /></div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Duration</p>
            </div>
            <p className="text-3xl font-black ml-1">{batch.stats.durationDays}<span className="text-base font-semibold text-muted-foreground ml-1">days</span></p>
            <p className="text-xs text-muted-foreground ml-1 mt-1">≈ {weeks} week{weeks !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm pb-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Layers className="h-4 w-4" /></div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Pricing</p>
            </div>
            {Object.entries(batch.pricing).length > 0 ? (
              Object.entries(batch.pricing).map(([currency, amount]) => {
                const orig = batch.originalPricing?.[currency];
                return (
                  <div key={currency} className="flex items-baseline gap-2 ml-1">
                    <p className="text-xl font-black">{sym(currency)}{amount.toLocaleString()}</p>
                    {orig != null && (
                      <p className="text-sm text-muted-foreground line-through">{sym(currency)}{orig.toLocaleString()}</p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground ml-1 mt-1">Uses course price</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Batch Info */}
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" /> Batch Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-x divide-y sm:divide-y-0">
            {[
              { label: "Start Date", value: fmt(batch.startDate) },
              { label: "End Date", value: fmt(batch.endDate) },
              { label: "Max Seats", value: batch.maxSeats?.toString() ?? "Unlimited" },
              { label: "WhatsApp Group", value: batch.whatsappGroupUrl ? "Configured" : "Not set" },
            ].map((item) => (
              <div key={item.label} className="px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{item.label}</p>
                <p className="font-bold text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            Enrolled Students
            <span className="ml-auto text-xs font-medium text-muted-foreground normal-case tracking-normal">
              {batch.enrollments.length} student{batch.enrollments.length !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        {batch.enrollments.length === 0 ? (
          <CardContent className="py-16 text-center text-muted-foreground">
            No students enrolled in this batch yet.
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">Student</TableHead>
                <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">Contact</TableHead>
                <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">Country</TableHead>
                <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">Enrollment Status</TableHead>
                <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">Payment</TableHead>
                <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">Enrolled On</TableHead>
                <TableHead className="px-6 py-4 text-right font-bold text-slate-800 uppercase text-xs tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batch.enrollments.map((enr) => {
                const payment = enr.payments[0] ?? null;
                return (
                  <TableRow key={enr.id} className="hover:bg-slate-50/50 border-b">
                    <TableCell className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{enr.student.name}</p>
                      <p className="text-xs text-muted-foreground">{enr.student.email}</p>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-slate-600 text-sm">{enr.student.phone ?? "—"}</TableCell>
                    <TableCell className="px-6 py-4 text-slate-600 text-sm">{enr.student.country ?? "—"}</TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`text-[11px] font-bold uppercase px-2 py-1 rounded-full ${ENROLL_STATUS_COLORS[enr.status] ?? "bg-slate-100 text-slate-700"}`}>
                        {enr.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {payment ? (
                        <div>
                          <p className="font-bold text-sm">{sym(payment.currency)}{payment.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{payment.method ?? "—"}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No payment</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(enr.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Link href={`/students/${enr.student.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
