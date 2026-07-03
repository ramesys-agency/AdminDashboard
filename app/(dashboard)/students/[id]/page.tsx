"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Calendar,
  User,
  GraduationCap,
  DollarSign,
  Gift,
  Copy,
  TrendingUp,
  ArrowUpRight,
  HandCoins,
  AlertCircle,
} from "lucide-react";

type RateType = "PERCENTAGE" | "FLAT";

type StudentDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  referralCode: string | null;
  discountType: RateType | null;
  discountValue: number | null;
  commissionType: RateType | null;
  commissionValue: number | null;
  totalEarned: number;
  totalPaid: number;
  additionalAmount: number;
  enrollments: Array<{
    id: string;
    status: string;
    createdAt: string;
    course: {
      id: string;
      name: string;
      pricing?: Array<{
        currency: string;
        amount: number;
      }>;
    };
  }>;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    method: string | null;
  }>;
  referredPayments: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    student: { name: string; email: string } | null;
    courseEnrollment: { course: { name: string } } | null;
  }>;
};

type ReferralSettings = {
  studentReferralEnabled: boolean;
  studentDiscountType: RateType;
  studentDiscountValue: number;
  studentCommissionType: RateType;
  studentCommissionValue: number;
};

function formatRate(type: RateType, value: number) {
  return type === "PERCENTAGE" ? `${value}%` : `$${value.toLocaleString()} flat`;
}

export default function StudentDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [payoutAmount, setPayoutAmount] = useState("");
  const [updating, setUpdating] = useState(false);

  // Override editor state ("" = use program default)
  const [overrides, setOverrides] = useState<{
    discountType: RateType;
    discountValue: string;
    commissionType: RateType;
    commissionValue: string;
  } | null>(null);
  const [savingOverrides, setSavingOverrides] = useState(false);

  const {
    data: student,
    isLoading: loading,
    mutate,
  } = useApi<StudentDetail>(id ? `/vydhra/students/${id}` : null, {
    onError: () => toast.error("Failed to load student."),
  });

  const { data: settings } = useApi<ReferralSettings>("/vydhra/referral-settings");

  const handleCopyCode = () => {
    if (!student?.referralCode) return;
    navigator.clipboard.writeText(student.referralCode);
    toast.success("Referral code copied to clipboard");
  };

  const handleRecordPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid amount greater than zero.",
      });
      return;
    }

    setUpdating(true);
    try {
      await apiClient.patch(`/vydhra/students/${id}`, {
        additionalAmount: amount,
      });
      toast.success("Payout Updated", {
        description: `Successfully updated paid amount by $${amount.toLocaleString()}`,
      });
      setPayoutAmount("");
      mutate();
    } catch (error: unknown) {
      toast.error("Update Failed", {
        description:
          error instanceof Error ? error.message : "Failed to update paid amount.",
      });
    } finally {
      setUpdating(false);
    }
  };

  const startEditingOverrides = () => {
    if (!student || !settings) return;
    setOverrides({
      discountType: student.discountType ?? settings.studentDiscountType,
      discountValue:
        student.discountValue !== null ? String(student.discountValue) : "",
      commissionType: student.commissionType ?? settings.studentCommissionType,
      commissionValue:
        student.commissionValue !== null ? String(student.commissionValue) : "",
    });
  };

  const handleSaveOverrides = async () => {
    if (!overrides) return;

    const parseOverride = (raw: string, type: RateType, label: string) => {
      if (raw.trim() === "") return null; // empty = use program default
      const value = parseFloat(raw);
      if (isNaN(value) || value < 0) {
        throw new Error(`${label} must be a non-negative number`);
      }
      if (type === "PERCENTAGE" && value > 100) {
        throw new Error(`${label} cannot exceed 100%`);
      }
      return value;
    };

    setSavingOverrides(true);
    try {
      const discountValue = parseOverride(
        overrides.discountValue,
        overrides.discountType,
        "Discount",
      );
      const commissionValue = parseOverride(
        overrides.commissionValue,
        overrides.commissionType,
        "Earning",
      );

      await apiClient.patch(`/vydhra/students/${id}`, {
        discountType: discountValue === null ? null : overrides.discountType,
        discountValue,
        commissionType: commissionValue === null ? null : overrides.commissionType,
        commissionValue,
      });
      toast.success("Referral overrides saved");
      setOverrides(null);
      mutate();
    } catch (error: unknown) {
      toast.error("Save Failed", {
        description:
          error instanceof Error ? error.message : "Failed to save overrides.",
      });
    } finally {
      setSavingOverrides(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20 border rounded-xl border-dashed">
        <p className="text-muted-foreground">Student not found.</p>
        <Link href="/students" className="mt-4 inline-block">
          <Button variant="outline">Back to Students</Button>
        </Link>
      </div>
    );
  }

  const completedReferrals = (student.referredPayments ?? []).filter(
    (p) => p.status === "COMPLETED",
  );
  const totalReferredSales = completedReferrals.reduce(
    (sum, p) => sum + (p.amount || 0),
    0,
  );
  const totalEarned = student.totalEarned || 0;
  const bonusAmount = student.additionalAmount || 0;
  const pendingAmount = totalEarned + bonusAmount - (student.totalPaid || 0);

  const effectiveDiscount = settings
    ? formatRate(
        student.discountType ?? settings.studentDiscountType,
        student.discountValue ?? settings.studentDiscountValue,
      )
    : "—";
  const effectiveCommission = settings
    ? formatRate(
        student.commissionType ?? settings.studentCommissionType,
        student.commissionValue ?? settings.studentCommissionValue,
      )
    : "—";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/students">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Student Details</h1>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl">
              <User className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold">{student.name}</h2>
                {student.referralCode && (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                    {student.referralCode}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-blue-50">
                <div className="flex items-center gap-1.5 text-sm">
                  <Mail className="h-4 w-4" />
                  {student.email}
                </div>
                {student.phone && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Phone className="h-4 w-4" />
                    {student.phone}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(student.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm px-4 py-1.5 text-sm font-medium">
                {student.enrollments.length} Enrollments
              </Badge>
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm px-4 py-1.5 text-sm font-medium">
                {completedReferrals.length} Referrals
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="enrollments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[540px] mb-6">
          <TabsTrigger value="enrollments" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Enrollments
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Referrals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden border">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Course Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10 hover:bg-muted/10">
                    <TableHead className="px-6 py-4 font-semibold text-slate-900">
                      Course Name
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-slate-900">
                      Status
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-slate-900">
                      Price
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-slate-900">
                      Enrolled On
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-slate-900 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.enrollments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-12 text-muted-foreground bg-muted/5"
                      >
                        No enrollments found for this student.
                      </TableCell>
                    </TableRow>
                  ) : (
                    student.enrollments.map((e) => (
                      <TableRow
                        key={e.id}
                        className="hover:bg-muted/5 transition-colors border-b"
                      >
                        <TableCell className="px-6 py-4 font-medium text-slate-900">
                          {e.course.name}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge
                            variant={
                            ["ENROLLED", "PAID", "ACTIVE", "COMPLETED"].includes(e.status) ? "default" : "secondary"
                            }
                            className="rounded-full px-3"
                          >
                            {e.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-slate-600 font-medium">
                          {(() => {
                            const usdPrice = e.course.pricing?.find((p) => p.currency === "USD")?.amount;
                            const inrPrice = e.course.pricing?.find((p) => p.currency === "INR")?.amount;
                            if (usdPrice !== undefined && usdPrice !== null) {
                              return `$${usdPrice.toLocaleString()}`;
                            }
                            if (inrPrice !== undefined && inrPrice !== null) {
                              return `₹${inrPrice.toLocaleString()}`;
                            }
                            return "—";
                          })()}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-slate-500">
                          {new Date(e.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Link href={`/courses/${e.course.id}`}>
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
        </TabsContent>

        <TabsContent value="payments" className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden border">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10 hover:bg-muted/10">
                    <TableHead className="px-6 py-4 font-semibold text-slate-900">
                      ID
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-slate-900">
                      Amount
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-slate-900">
                      Status
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-slate-900">
                      Method
                    </TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-slate-900">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.payments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-12 text-muted-foreground bg-muted/5"
                      >
                        No payments found for this student.
                      </TableCell>
                    </TableRow>
                  ) : (
                    student.payments.map((p) => (
                      <TableRow
                        key={p.id}
                        className="hover:bg-muted/5 transition-colors border-b"
                      >
                        <TableCell className="px-6 py-4 text-xs font-mono text-muted-foreground">
                          {p.id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell className="px-6 py-4 font-bold text-slate-900">
                          ${p.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge
                            variant={
                              p.status === "COMPLETED"
                                ? "default"
                                : p.status === "FAILED"
                                  ? "destructive"
                                  : "outline"
                            }
                            className="rounded-full px-3"
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-slate-600">
                          {p.method || "N/A"}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-slate-500">
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

        <TabsContent value="referrals" className="mt-0 space-y-6">
          {/* Referral code + effective rates */}
          <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Referral Code
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black font-mono tracking-wider">
                      {student.referralCode ?? "—"}
                    </span>
                    {student.referralCode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={handleCopyCode}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share this code — friends use it in the coupon field at checkout.
                  </p>
                </div>
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                      Friend&apos;s Discount
                    </p>
                    <p className="text-xl font-bold">
                      {effectiveDiscount}
                      {student.discountValue === null && (
                        <span className="text-xs font-medium text-muted-foreground ml-2">
                          (default)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                      Student&apos;s Earning
                    </p>
                    <p className="text-xl font-bold">
                      {effectiveCommission}
                      {student.commissionValue === null && (
                        <span className="text-xs font-medium text-muted-foreground ml-2">
                          (default)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={startEditingOverrides} disabled={!settings}>
                  Edit Overrides
                </Button>
              </div>
              {settings && !settings.studentReferralEnabled && (
                <div className="mt-4 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/30 rounded-lg px-4 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  The student referral program is currently disabled in Referral Settings —
                  this code will not be accepted at checkout.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Override editor */}
          {overrides && (
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Per-Student Overrides</CardTitle>
                <CardDescription>
                  Leave a value empty to use the program default from Referral Settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Friend&apos;s Discount
                    </Label>
                    <div className="flex gap-3">
                      <select
                        className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={overrides.discountType}
                        onChange={(e) =>
                          setOverrides({
                            ...overrides,
                            discountType: e.target.value as RateType,
                          })
                        }
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FLAT">Flat ($)</option>
                      </select>
                      <Input
                        type="number"
                        min="0"
                        placeholder={
                          settings
                            ? `Default: ${settings.studentDiscountValue}`
                            : ""
                        }
                        value={overrides.discountValue}
                        onChange={(e) =>
                          setOverrides({ ...overrides, discountValue: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Student&apos;s Earning
                    </Label>
                    <div className="flex gap-3">
                      <select
                        className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={overrides.commissionType}
                        onChange={(e) =>
                          setOverrides({
                            ...overrides,
                            commissionType: e.target.value as RateType,
                          })
                        }
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FLAT">Flat ($)</option>
                      </select>
                      <Input
                        type="number"
                        min="0"
                        placeholder={
                          settings
                            ? `Default: ${settings.studentCommissionValue}`
                            : ""
                        }
                        value={overrides.commissionValue}
                        onChange={(e) =>
                          setOverrides({
                            ...overrides,
                            commissionValue: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSaveOverrides} disabled={savingOverrides}>
                    {savingOverrides && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Save Overrides
                  </Button>
                  <Button variant="ghost" onClick={() => setOverrides(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm group hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Referred Sales
                  </p>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold">
                  ${totalReferredSales.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedReferrals.length} completed transactions
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm transition-all border-l-4 border-l-orange-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Earned
                  </p>
                  <ArrowUpRight className="h-4 w-4 text-orange-500" />
                </div>
                <p className="text-2xl font-bold">${totalEarned.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {effectiveCommission} referral earning
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm transition-all bg-blue-50/30 dark:bg-blue-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending Payout
                  </p>
                  <HandCoins className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  ${pendingAmount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Released{" "}
                  {(student.totalPaid || 0) > 0
                    ? `$${(student.totalPaid || 0).toLocaleString()}`
                    : "nothing"}{" "}
                  so far
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Referred sales + payout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm overflow-hidden lg:col-span-2">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg font-semibold">
                  Referred Enrollments
                </CardTitle>
                <CardDescription>
                  Course purchases made with referral code{" "}
                  {student.referralCode ?? "—"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="px-6 py-4 font-semibold">
                        Friend
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold">
                        Amount
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold">
                        Status
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold">
                        Course
                      </TableHead>
                      <TableHead className="px-6 py-4 font-semibold text-right">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(student.referredPayments ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-12 text-muted-foreground"
                        >
                          No referral sales tracked yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      student.referredPayments.map((p) => (
                        <TableRow
                          key={p.id}
                          className="hover:bg-muted/5 transition-colors border-b"
                        >
                          <TableCell className="px-6 py-4">
                            <div className="font-medium text-slate-900">
                              {p.student?.name ?? "—"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {p.student?.email ?? ""}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-bold text-slate-900">
                            ${p.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <Badge
                              variant={
                                p.status === "COMPLETED" ? "default" : "outline"
                              }
                            >
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="font-medium text-slate-700">
                              {p.courseEnrollment?.course.name || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right text-slate-500">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Payout form */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HandCoins className="h-5 w-5 text-blue-600" />
                  Record Payout
                </CardTitle>
                <CardDescription>
                  Manually update the amount paid to this student.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Additional Amount Paid ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 50"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="focus-visible:ring-blue-500"
                  />
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={updating}
                  onClick={handleRecordPayout}
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Confirm Settlement
                </Button>
                <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border text-xs text-muted-foreground mt-4">
                  <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <p>
                    Recording a payout increases &quot;Total Paid&quot; and reduces
                    the &quot;Pending Payout&quot; relative to earnings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
