"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Calendar, Tag, Percent, Users, CheckCircle, Clock, Gift, DollarSign, ArrowLeft } from "lucide-react";

type CouponDetail = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maxUses: number | null;
  currentUses: number;
  validUntil: string | null;
  createdAt: string;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    student: { name: string; email: string };
  }>;
};

export default function CouponDetailPage() {
  const { id } = useParams();
  const [coupon, setCoupon] = useState<CouponDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      apiClient.get<CouponDetail>(`/vydhra/coupons/${id}`)
        .then(setCoupon)
        .catch((err) => {
          console.error("Failed to fetch coupon:", err);
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

  if (!coupon) {
    return (
      <div className="text-center py-20 border rounded-xl border-dashed">
        <p className="text-muted-foreground">Coupon not found.</p>
        <Link href="/coupons" className="mt-4 inline-block">
          <Button variant="outline">Back to Coupons</Button>
        </Link>
      </div>
    );
  }

  const isExpired = coupon.validUntil && new Date(coupon.validUntil) < new Date();
  const isFullyUsed = coupon.maxUses && coupon.currentUses >= coupon.maxUses;
  const isActive = !isExpired && !isFullyUsed;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/coupons">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Coupon Analysis</h1>
        </div>
      </div>

      {/* Coupon Header */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-pink-600 to-rose-700 text-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl">
              <Tag className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-black tracking-tighter uppercase">{coupon.code}</h2>
                <Badge className={`${isActive ? 'bg-emerald-400' : 'bg-rose-400'} text-slate-900 border-none px-3 font-bold`}>
                  {isActive ? 'ACTIVE' : isExpired ? 'EXPIRED' : 'USED UP'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-pink-100 uppercase tracking-widest">
                  {coupon.discountType === "PERCENTAGE" ? (
                    <><Percent className="h-3.5 w-3.5" />{coupon.discountValue}% Discount</>
                  ) : (
                    <><DollarSign className="h-3.5 w-3.5" />₹{coupon.discountValue.toLocaleString()} Off</>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-pink-100 uppercase tracking-widest">
                  <Calendar className="h-3.5 w-3.5" />
                  Created {new Date(coupon.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 text-center min-w-[180px]">
              <p className="text-[10px] text-white/70 uppercase font-black tracking-widest mb-1">Status Overview</p>
              <div className="flex justify-between items-end gap-4 mt-2">
                <div className="text-left">
                  <p className="text-2xl font-black">{coupon.currentUses}</p>
                  <p className="text-[8px] uppercase font-bold text-white/60">Used</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black">{coupon.maxUses || '∞'}</p>
                  <p className="text-[8px] uppercase font-bold text-white/60">Limit</p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-white shadow-[0_0_10px_white] transition-all duration-1000" 
                  style={{ width: `${coupon.maxUses ? (coupon.currentUses / coupon.maxUses) * 100 : 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm flex items-center p-6 gap-4">
          <div className="h-12 w-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-black tracking-wider">Offer Details</p>
            <p className="text-lg font-bold">
              {coupon.discountType === "PERCENTAGE" 
                ? `${coupon.discountValue}% OFF Every Buy` 
                : `₹${coupon.discountValue.toLocaleString()} OFF Every Buy`}
            </p>
          </div>
        </Card>

        <Card className="border-none shadow-sm flex items-center p-6 gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-black tracking-wider">Expiry Status</p>
            <p className="text-lg font-bold">
              {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'Forever Valid'}
            </p>
          </div>
        </Card>

        <Card className="border-none shadow-sm flex items-center p-6 gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-black tracking-wider">Total Impact</p>
            <p className="text-lg font-bold">{coupon.currentUses} Sales Influenced</p>
          </div>
        </Card>
      </div>

      {/* Usage History Tabs */}
      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-64 grid-cols-1 mb-6 shadow-sm border bg-slate-50/50 p-1">
          <TabsTrigger value="usage" className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usage History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/10 border-b">
              <CardTitle className="text-base font-bold">Detailed Redemption Logs</CardTitle>
              <CardDescription>Track every transaction where this coupon was applied.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-[10px] tracking-widest">Transaction ID</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-[10px] tracking-widest">Student</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-[10px] tracking-widest">Amount Paid</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-[10px] tracking-widest">Status</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-[10px] tracking-widest text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupon.payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                        No one has used this coupon yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    coupon.payments.map((p) => (
                      <TableRow key={p.id} className="hover:bg-slate-50/30 transition-colors border-b">
                        <TableCell className="px-6 py-4 font-mono text-xs text-muted-foreground">
                          #{p.id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{p.student.name}</div>
                          <div className="text-[10px] text-muted-foreground">{p.student.email}</div>
                        </TableCell>
                        <TableCell className="px-6 py-4 font-black text-slate-900">₹{p.amount.toLocaleString()}</TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge 
                            variant={p.status === 'COMPLETED' ? 'default' : 'outline'} 
                            className="rounded px-2 text-[10px] font-bold"
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
