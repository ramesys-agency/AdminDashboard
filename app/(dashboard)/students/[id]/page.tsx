"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Mail,
  Phone,
  Calendar,
  User,
  GraduationCap,
  DollarSign,
} from "lucide-react";

type StudentDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  enrollments: Array<{
    id: string;
    status: string;
    createdAt: string;
    course: {
      id: string;
      name: string;
      price: number;
    };
  }>;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    method: string | null;
  }>;
};

export default function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      apiClient
        .get<StudentDetail>(`/vydhra/students/${id}`)
        .then(setStudent)
        .catch((err) => {
          console.error("Failed to fetch student:", err);
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
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
              <h2 className="text-3xl font-bold">{student.name}</h2>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="enrollments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-6">
          <TabsTrigger value="enrollments" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Enrollments
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payments
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
                              e.status === "ENROLLED" ? "default" : "secondary"
                            }
                            className="rounded-full px-3"
                          >
                            {e.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-slate-600 font-medium">
                          ${e.course.price.toLocaleString()}
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
      </Tabs>
    </div>
  );
}
