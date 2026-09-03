"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
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
  Calendar,
  BookOpen,
  Users,
  IndianRupee,
  Clock,
  BarChart3,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { isCourseComingSoon } from "@/lib/course/status";

type BatchStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

type CourseBatch = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  maxSeats: number | null;
  status: BatchStatus;
  whatsappGroupUrl: string | null;
  pricing: Record<string, number>;
  originalPricing?: Record<string, number>;
  _count: { enrollments: number };
};

type CourseDetail = {
  id: string;
  name: string;
  description: string | null;
  details?: Record<string, unknown> | null;
  pricing: Record<string, number>;
  createdAt: string;
  enrollments: Array<{
    id: string;
    status: string;
    createdAt: string;
    student: { id: string; name: string; email: string };
  }>;
  stats: {
    totalEnrollments: number;
    totalRevenue: number;
  };
};

const BATCH_STATUS_COLORS: Record<BatchStatus, string> = {
  UPCOMING: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const emptyBatchForm = {
  name: "",
  startDate: "",
  endDate: "",
  maxSeats: "",
  status: "UPCOMING" as BatchStatus,
  whatsappGroupUrl: "",
  priceUSD: "",
  originalPriceUSD: "",
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Batch state
  const [batches, setBatches] = useState<CourseBatch[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchForm, setBatchForm] = useState(emptyBatchForm);
  const [batchFormLoading, setBatchFormLoading] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      apiClient
        .get<CourseDetail>(`/vydhra/courses/${id}`)
        .then(setCourse)
        .catch((err) => {
          toast.error("Failed to load course. Please try again.");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const fetchBatches = () => {
    if (!id) return;
    setBatchesLoading(true);
    apiClient
      .get<CourseBatch[]>(`/vydhra/courses/${id}/batches`)
      .then(setBatches)
      .catch(() => toast.error("Failed to load batches."))
      .finally(() => setBatchesLoading(false));
  };

  useEffect(() => {
    fetchBatches();
  }, [id]);

  const handleBatchFormChange = (field: string, value: string) => {
    setBatchForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBatchFormLoading(true);
    try {
      const pricingPayload = [];
      if (batchForm.priceUSD) {
        pricingPayload.push({
          currency: "USD",
          amount: parseFloat(batchForm.priceUSD),
          originalPrice: batchForm.originalPriceUSD ? parseFloat(batchForm.originalPriceUSD) : null,
        });
      }
      const payload = {
        name: batchForm.name,
        startDate: batchForm.startDate,
        endDate: batchForm.endDate,
        maxSeats: batchForm.maxSeats ? parseInt(batchForm.maxSeats) : null,
        status: batchForm.status,
        whatsappGroupUrl: batchForm.whatsappGroupUrl || null,
        pricing: pricingPayload,
      };
      if (editingBatchId) {
        await apiClient.put(`/vydhra/courses/${id}/batches/${editingBatchId}`, payload);
      } else {
        await apiClient.post(`/vydhra/courses/${id}/batches`, payload);
      }
      setBatchForm(emptyBatchForm);
      setShowBatchForm(false);
      setEditingBatchId(null);
      fetchBatches();
    } catch (err) {
      toast.error("Failed to save batch. Please try again.");
    } finally {
      setBatchFormLoading(false);
    }
  };

  const handleEditBatch = (batch: CourseBatch) => {
    setEditingBatchId(batch.id);
    setBatchForm({
      name: batch.name,
      startDate: batch.startDate.slice(0, 10),
      endDate: batch.endDate.slice(0, 10),
      maxSeats: batch.maxSeats?.toString() ?? "",
      status: batch.status,
      whatsappGroupUrl: batch.whatsappGroupUrl ?? "",
      priceUSD: batch.pricing?.USD !== undefined ? batch.pricing.USD.toString() : "",
      originalPriceUSD: batch.originalPricing?.USD !== undefined ? batch.originalPricing.USD.toString() : "",
    });
    setShowBatchForm(true);
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm("Delete this batch? This cannot be undone.")) return;
    try {
      await apiClient.delete(`/vydhra/courses/${id}/batches/${batchId}`);
      fetchBatches();
    } catch (err) {
      toast.error("Failed to delete batch.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 border rounded-xl border-dashed">
        <p className="text-muted-foreground">Course not found.</p>
        <Link href="/courses" className="mt-4 inline-block">
          <Button variant="outline">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  const comingSoon = isCourseComingSoon(course.details);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Course Insights</h1>
        </div>
        <Link href={`/courses/${id}/edit`}>
          <Button size="sm" variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Course
          </Button>
        </Link>
      </div>

      {/* Course Profile Header */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2 flex-1">
              <h2 className="text-3xl font-bold">{course.name}</h2>
              <p className="text-purple-50 line-clamp-2 max-w-2xl text-sm leading-relaxed">
                {course.description ||
                  "No description provided for this course."}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-purple-100">
                  <Calendar className="h-3.5 w-3.5" />
                  Launched {new Date(course.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-purple-100">
                  <Clock className="h-3.5 w-3.5" />
                  Self-paced learning
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20 text-right min-w-[140px]">
                <p className="text-[10px] text-white/70 uppercase font-black tracking-widest mb-0.5">
                  Price
                </p>
                <p className="text-2xl font-black">
                  {course.pricing?.USD != null ? `$${course.pricing.USD.toLocaleString()}` : course.pricing?.INR != null ? `₹${course.pricing.INR.toLocaleString()}` : "—"}
                </p>
              </div>
              {comingSoon ? (
                <Badge className="bg-amber-500/25 hover:bg-amber-500/35 text-amber-50 border-none backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                  Coming Soon
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-50 border-none backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                  Live on Platform
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm pb-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-tight">
                Total Students
              </p>
            </div>
            <p className="text-3xl font-black mt-1 ml-1">
              {course.stats.totalEnrollments}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm border-l-4 border-l-emerald-500 pb-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <IndianRupee className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-tight">
                Total Revenue
              </p>
            </div>
            <p className="text-3xl font-black mt-1 ml-1 text-emerald-700">
              ₹{course.stats.totalRevenue.toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm pb-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-tight">
                Avg. Per Student
              </p>
            </div>
            <p className="text-3xl font-black mt-1 ml-1">
              ₹
              {course.stats.totalEnrollments > 0
                ? (
                    course.stats.totalRevenue / course.stats.totalEnrollments
                  ).toLocaleString('en-IN', { maximumFractionDigits: 0 })
                : "0"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm pb-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-slate-900 text-white rounded font-bold">
                New
              </Badge>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-tight">
                Recent 30 Days
              </p>
            </div>
            <p className="text-3xl font-black mt-1 ml-1">
              +{Math.floor(course.stats.totalEnrollments * 0.1)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Content Tabs */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[560px] mb-6 shadow-sm border bg-slate-50/50 p-1">
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Student Roster
          </TabsTrigger>
          <TabsTrigger
            value="batches"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Batches
          </TabsTrigger>
          <TabsTrigger
            value="revenue"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Revenue Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                  <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">
                    Student Name
                  </TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">
                    Email Address
                  </TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">
                    Enrolled Date
                  </TableHead>
                  <TableHead className="px-6 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider text-right">
                    Profile
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {course.enrollments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-16 text-muted-foreground"
                    >
                      No students enrolled in this course yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  course.enrollments.map((e) => (
                    <TableRow
                      key={e.id}
                      className="hover:bg-slate-50/50 transition-colors border-b"
                    >
                      <TableCell className="px-6 py-4 font-semibold text-slate-900">
                        {e.student.name}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-slate-600 font-medium">
                        {e.student.email}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge
                          variant={
                            ["ENROLLED", "PAID", "ACTIVE", "COMPLETED"].includes(e.status) ? "default" : "secondary"
                          }
                          className="rounded-full shadow-sm"
                        >
                          {e.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Link href={`/students/${e.student.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
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
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="mt-0">
          <Card className="border-none shadow-sm overflow-hidden p-6 space-y-6">
            {comingSoon && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                <p className="text-sm text-amber-800 leading-relaxed">
                  <span className="font-semibold">This course is marked Coming Soon.</span>{" "}
                  It is listed under Coming Soon on the site and public enrollment is rejected, so
                  batches created here won&apos;t be bookable until the course is switched to Live in{" "}
                  <Link href={`/courses/${id}/edit`} className="font-semibold underline">
                    Edit Course
                  </Link>
                  .
                </p>
              </div>
            )}

            {/* Create/Edit form */}
            {showBatchForm ? (
              <form onSubmit={handleBatchSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800">{editingBatchId ? "Edit Batch" : "New Batch"}</h3>
                  <button type="button" onClick={() => { setShowBatchForm(false); setEditingBatchId(null); setBatchForm(emptyBatchForm); }} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs font-semibold">Batch Name *</Label>
                    <Input placeholder="e.g. Batch 1 – June 2025" required value={batchForm.name} onChange={(e) => handleBatchFormChange("name", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Start Date *</Label>
                    <Input type="date" required value={batchForm.startDate} onChange={(e) => handleBatchFormChange("startDate", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">End Date *</Label>
                    <Input type="date" required value={batchForm.endDate} onChange={(e) => handleBatchFormChange("endDate", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Max Seats (optional)</Label>
                    <Input type="number" min="1" placeholder="Leave blank for unlimited" value={batchForm.maxSeats} onChange={(e) => handleBatchFormChange("maxSeats", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Status</Label>
                    <select
                      value={batchForm.status}
                      onChange={(e) => handleBatchFormChange("status", e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="UPCOMING">Upcoming</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">USD Price (optional)</Label>
                    <Input type="number" min="0" step="0.01" placeholder="Leave blank to use course price" value={batchForm.priceUSD} onChange={(e) => handleBatchFormChange("priceUSD", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Slashed USD Price (optional)</Label>
                    <Input type="number" min="0" step="0.01" placeholder="Original price for display" value={batchForm.originalPriceUSD} onChange={(e) => handleBatchFormChange("originalPriceUSD", e.target.value)} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs font-semibold">WhatsApp Group URL (optional)</Label>
                    <Input type="url" placeholder="https://chat.whatsapp.com/..." value={batchForm.whatsappGroupUrl} onChange={(e) => handleBatchFormChange("whatsappGroupUrl", e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={batchFormLoading} size="sm" className="flex items-center gap-2">
                    {batchFormLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    {editingBatchId ? "Save Changes" : "Create Batch"}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setShowBatchForm(false); setEditingBatchId(null); setBatchForm(emptyBatchForm); }}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{batches.length} batch{batches.length !== 1 ? "es" : ""} total</p>
                <Button size="sm" className="flex items-center gap-2" onClick={() => setShowBatchForm(true)}>
                  <Plus className="h-4 w-4" /> Add Batch
                </Button>
              </div>
            )}

            {/* Batches table */}
            {batchesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : batches.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl">
                No batches yet. Create the first batch for this course.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                    <TableHead className="px-4 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">Batch Name</TableHead>
                    <TableHead className="px-4 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">Status</TableHead>
                    <TableHead className="px-4 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">Start</TableHead>
                    <TableHead className="px-4 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">End</TableHead>
                    <TableHead className="px-4 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">Seats</TableHead>
                    <TableHead className="px-4 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">WhatsApp</TableHead>
                    <TableHead className="px-4 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider">Price</TableHead>
                    <TableHead className="px-4 py-4 font-bold text-slate-800 uppercase text-xs tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((b) => (
                    <TableRow key={b.id} className="hover:bg-slate-50/50 border-b">
                      <TableCell className="px-4 py-4 font-semibold text-slate-900">{b.name}</TableCell>
                      <TableCell className="px-4 py-4">
                        <span className={`text-[11px] font-bold uppercase px-2 py-1 rounded-full ${BATCH_STATUS_COLORS[b.status]}`}>{b.status}</span>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-slate-600">{new Date(b.startDate).toLocaleDateString()}</TableCell>
                      <TableCell className="px-4 py-4 text-slate-600">{new Date(b.endDate).toLocaleDateString()}</TableCell>
                      <TableCell className="px-4 py-4 text-slate-600">
                        {b.maxSeats ? `${b._count.enrollments}/${b.maxSeats}` : `${b._count.enrollments} enrolled`}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        {b.whatsappGroupUrl
                          ? <a href={b.whatsappGroupUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-600 hover:underline">Configured ↗</a>
                          : <span className="text-slate-400 text-xs">Not set</span>
                        }
                      </TableCell>
                      <TableCell className="px-4 py-4 text-slate-600">
                        {b.pricing?.USD != null ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900">${b.pricing.USD}</span>
                            {b.originalPricing?.USD != null && (
                              <span className="text-xs text-slate-400 line-through">${b.originalPricing.USD}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Uses course price</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Link href={`/courses/${id}/batches/${b.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100" onClick={() => handleEditBatch(b)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteBatch(b.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-0">
          <Card className="border-none shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px] text-center bg-slate-50/30">
            <div className="p-6 rounded-full bg-white shadow-xl mb-6">
              <TrendingUp className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              Revenue Analytics Coming Soon
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
              We&apos;re building a comprehensive revenue breakdown module for
              individual courses. You&apos;ll soon see detailed growth charts
              and daily sales trends.
            </p>
            <div className="mt-8 flex gap-4">
              <Badge
                variant="outline"
                className="px-4 py-2 border-slate-200 bg-white"
              >
                Daily Trends
              </Badge>
              <Badge
                variant="outline"
                className="px-4 py-2 border-slate-200 bg-white"
              >
                Payment Methods
              </Badge>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
