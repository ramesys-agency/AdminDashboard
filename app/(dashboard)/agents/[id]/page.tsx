"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Calendar,
  User,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  HandCoins,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type AgentDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  code: string;
  discountPercent: number;
  commissionType: "PERCENTAGE" | "FLAT";
  commissionValue: number;
  totalPaid: number;
  totalEarned: number;
  additionalAmount: number;
  createdAt: string;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    student: { name: string; email: string };
    courseEnrollment: { course: { name: string } } | null;
  }>;
};

export default function AgentDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [updating, setUpdating] = useState(false);

  // Use a ref to prevent double-fetching on mount in strict mode
  const fetchedRef = React.useRef(false);

  const fetchAgent = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await apiClient.get<AgentDetail>(`/vydhra/agents/${id}`);
      setAgent(data);
    } catch (err) {
      console.error("Failed to fetch agent:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchAgent();
      fetchedRef.current = true;
    }
  }, [id, fetchAgent]);

  const handleUpdatePaid = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid amount greater than zero.",
      });
      return;
    }

    setUpdating(true);
    try {
      await apiClient.patch(`/vydhra/agents/${id}`, {
        additionalAmount: amount,
      });
      toast.success("Payout Updated", {
        description: `Successfully updated paid amount by $${amount.toLocaleString()}`,
      });
      setPayoutAmount("");
      fetchAgent(); // Refresh data
    } catch (error: unknown) {
      toast.error("Update Failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update paid amount.",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-20 border rounded-xl border-dashed">
        <p className="text-muted-foreground">Agent not found.</p>
        <Link href="/agents" className="mt-4 inline-block">
          <Button variant="outline">Back to Agents</Button>
        </Link>
      </div>
    );
  }

  // Use persisted earnings and payouts
  const completedPayments = agent.payments.filter(
    (p) => p.status === "COMPLETED",
  );
  const totalSales = completedPayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0,
  );

  const totalEarned = agent.totalEarned || 0;
  const bonusAmount = agent.additionalAmount || 0;
  const pendingAmount = totalEarned + bonusAmount - (agent.totalPaid || 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/agents">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Agent Dashboard</h1>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl">
              <User className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold">{agent.name}</h2>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                  {agent.code}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-emerald-50">
                <div className="flex items-center gap-1.5 text-sm">
                  <Mail className="h-4 w-4" />
                  {agent.email}
                </div>
                {agent.phone && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Phone className="h-4 w-4" />
                    {agent.phone}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar className="h-4 w-4" />
                  Agent Since {new Date(agent.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 min-w-[200px]">
              <p className="text-xs text-white/70 uppercase font-semibold mb-1">
                Current Commission
              </p>
              <p className="text-2xl font-black">
                {agent.commissionType === "PERCENTAGE"
                  ? `${agent.commissionValue || 0}%`
                  : `$${(agent.commissionValue || 0).toLocaleString()} flat`}
              </p>
              <p className="text-[10px] text-white/50 mt-1">
                Applied per successful referral
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm group hover:shadow-md transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total Sales Generated
              </p>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold">${totalSales.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {completedPayments.length} completed transactions
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
            <p className="text-2xl font-bold">
              ${totalEarned.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {agent.commissionValue}
              {agent.commissionType === "PERCENTAGE" ? "%" : " flat"} commission
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm transition-all bg-emerald-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Pending Payout
              </p>
              <HandCoins className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              ${pendingAmount.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600/70 mt-1">
              Released{" "}
              {(agent.totalPaid || 0) > 0
                ? `$${(agent.totalPaid || 0).toLocaleString()}`
                : "nothing"}{" "}
              so far
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="referrals" className="w-full flex flex-col gap-6">
        <TabsList className="bg-slate-100/50 border p-1 rounded-xl w-fit h-auto gap-1">
          <TabsTrigger
            value="referrals"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all data-[active]:bg-white data-[active]:text-emerald-700 data-[active]:shadow-sm text-slate-500"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Referral Sales
          </TabsTrigger>
          <TabsTrigger
            value="payouts"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all data-[active]:bg-white data-[active]:text-emerald-700 data-[active]:shadow-sm text-slate-500"
          >
            <DollarSign className="h-3.5 w-3.5" />
            Payout Management
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="referrals"
          className="space-y-4 mt-0 border-none outline-none"
        >
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg font-semibold">
                Sales History
              </CardTitle>
              <CardDescription>
                All course purchases made using referral code {agent.code}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10">
                    <TableHead className="px-6 py-4 font-semibold">
                      Student
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
                  {agent.payments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No referral sales tracked yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    agent.payments.map((p) => (
                      <TableRow
                        key={p.id}
                        className="hover:bg-muted/5 transition-colors border-b"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {p.student.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {p.student.email}
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
        </TabsContent>

        <TabsContent value="payouts" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payout Update Form */}
            <Card className="border-none shadow-sm lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HandCoins className="h-5 w-5 text-emerald-600" />
                  Record Payout
                </CardTitle>
                <CardDescription>
                  Manually update the amount paid to this agent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Additional Amount Paid ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 5000"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="focus-visible:ring-emerald-500"
                  />
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={updating}
                  onClick={handleUpdatePaid}
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Confirm Settlement
                </Button>
                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border text-xs text-muted-foreground mt-4">
                  <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <p>
                    Recording a payout will increase the &quot;Total Paid&quot;
                    amount and decrease the &quot;Pending Payout&quot; relative
                    to earnings.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payout Summary */}
            <Card className="border-none shadow-sm lg:col-span-2 group hover:shadow-md transition-all">
              <CardHeader className="bg-slate-50/50 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Payout Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  <div className="flex justify-between items-end border-b pb-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">
                        Total Commission Earned
                      </p>
                      <p className="text-3xl font-black text-slate-900">
                        ${totalEarned.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">
                        Total Paid To Date
                      </p>
                      <p className="text-3xl font-black text-emerald-600">
                        ${(agent.totalPaid || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span>Payout Progress</span>
                      <span
                        className={
                          pendingAmount <= 0
                            ? "text-emerald-600"
                            : "text-orange-600"
                        }
                      >
                        {totalEarned > 0
                          ? Math.round(
                              ((agent.totalPaid || 0) /
                                (totalEarned + bonusAmount)) *
                                100,
                            )
                          : 0}
                        % Paid
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-1000"
                        style={{
                          width: `${totalEarned > 0 ? Math.min(((agent.totalPaid || 0) / (totalEarned + bonusAmount)) * 100, 100) : 0}%`,
                        }}
                      />
                    </div>
                    <div className="mt-6 p-4 rounded-xl border border-dashed text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Current Outstanding Balance (Inc. Bonus)
                      </p>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter">
                        ${pendingAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
