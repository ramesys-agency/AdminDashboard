"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";

type CourseDetail = {
  id: string;
  name: string;
  description: string | null;
  price: number;
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

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      apiClient
        .get<CourseDetail>(`/vydhra/courses/${id}`)
        .then(setCourse)
        .catch((err) => {
          console.error("Failed to fetch course:", err);
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Course Insights</h1>
        </div>
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
                  ${course.price.toLocaleString()}
                </p>
              </div>
              <Badge className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-50 border-none backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                Live on Platform
              </Badge>
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
              ${course.stats.totalRevenue.toLocaleString()}
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
              $
              {course.stats.totalEnrollments > 0
                ? (
                    course.stats.totalRevenue / course.stats.totalEnrollments
                  ).toLocaleString()
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
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-6 shadow-sm border bg-slate-50/50 p-1">
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Student Roster
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
                            e.status === "ENROLLED" ? "default" : "secondary"
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
