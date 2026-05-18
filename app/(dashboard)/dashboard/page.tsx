"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { useBusiness } from "@/context/BusinessContext";
import { apiClient, PaginatedResponse } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  CreditCard,
  MessageSquare,
  UserCircle,
  Briefcase,
  TrendingUp,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
  loading?: boolean;
}

function StatCardItem({ label, value, icon: Icon, href, color, bgColor, loading }: StatCard) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border border-border/60 hover:border-primary/30 group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {label}
              </p>
              {loading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded-md" />
              ) : (
                <p className="text-3xl font-bold text-foreground">{value}</p>
              )}
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor} group-hover:scale-110 transition-transform`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { activeBusiness } = useBusiness();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      if (activeBusiness === "vydhra") {
        const [students, courses, payments, enquiries, agents] = await Promise.allSettled([
          apiClient.get<PaginatedResponse<unknown>>("/vydhra/students?limit=1"),
          apiClient.get<PaginatedResponse<unknown>>("/vydhra/courses?limit=1"),
          apiClient.get<PaginatedResponse<unknown>>("/vydhra/payments?limit=1&status=COMPLETED"),
          apiClient.get<PaginatedResponse<unknown>>("/vydhra/enquiries?limit=1&status=NEW"),
          apiClient.get<PaginatedResponse<unknown>>("/vydhra/agents?limit=1"),
        ]);
        setStats({
          students: students.status === "fulfilled" ? students.value.metadata?.total ?? 0 : 0,
          courses: courses.status === "fulfilled" ? courses.value.metadata?.total ?? 0 : 0,
          payments: payments.status === "fulfilled" ? payments.value.metadata?.total ?? 0 : 0,
          enquiries: enquiries.status === "fulfilled" ? enquiries.value.metadata?.total ?? 0 : 0,
          agents: agents.status === "fulfilled" ? agents.value.metadata?.total ?? 0 : 0,
        });
      } else {
        const [clients, projects, activeProjects, payments, invoices] = await Promise.allSettled([
          apiClient.get<PaginatedResponse<unknown>>("/ramesys/clients?limit=1"),
          apiClient.get<PaginatedResponse<unknown>>("/ramesys/projects?limit=1"),
          apiClient.get<PaginatedResponse<unknown>>("/ramesys/projects?limit=1&status=IN_PROGRESS"),
          apiClient.get<PaginatedResponse<unknown>>("/ramesys/payments?limit=1&status=COMPLETED"),
          apiClient.get<PaginatedResponse<unknown>>("/ramesys/invoices?limit=1&status=PENDING"),
        ]);
        setStats({
          clients: clients.status === "fulfilled" ? clients.value.metadata?.total ?? 0 : 0,
          projects: projects.status === "fulfilled" ? projects.value.metadata?.total ?? 0 : 0,
          activeProjects: activeProjects.status === "fulfilled" ? activeProjects.value.metadata?.total ?? 0 : 0,
          payments: payments.status === "fulfilled" ? payments.value.metadata?.total ?? 0 : 0,
          invoices: invoices.status === "fulfilled" ? invoices.value.metadata?.total ?? 0 : 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const vydhraCards: StatCard[] = [
    { label: "Total Students", value: stats.students ?? 0, icon: Users, href: "/students", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30", loading },
    { label: "Total Courses", value: stats.courses ?? 0, icon: GraduationCap, href: "/courses", color: "text-violet-600", bgColor: "bg-violet-100 dark:bg-violet-900/30", loading },
    { label: "Completed Payments", value: stats.payments ?? 0, icon: CreditCard, href: "/payments", color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", loading },
    { label: "New Enquiries", value: stats.enquiries ?? 0, icon: MessageSquare, href: "/enquiries", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30", loading },
    { label: "Active Agents", value: stats.agents ?? 0, icon: UserCircle, href: "/agents", color: "text-rose-600", bgColor: "bg-rose-100 dark:bg-rose-900/30", loading },
  ];

  const ramesysCards: StatCard[] = [
    { label: "Total Clients", value: stats.clients ?? 0, icon: Users, href: "/clients", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30", loading },
    { label: "Total Projects", value: stats.projects ?? 0, icon: Briefcase, href: "/projects", color: "text-violet-600", bgColor: "bg-violet-100 dark:bg-violet-900/30", loading },
    { label: "Active Projects", value: stats.activeProjects ?? 0, icon: TrendingUp, href: "/projects", color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", loading },
    { label: "Completed Payments", value: stats.payments ?? 0, icon: CreditCard, href: "/payments", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30", loading },
    { label: "Pending Invoices", value: stats.invoices ?? 0, icon: FileText, href: "/invoices", color: "text-rose-600", bgColor: "bg-rose-100 dark:bg-rose-900/30", loading },
  ];

  const cards = activeBusiness === "vydhra" ? vydhraCards : ramesysCards;

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <PageHeader
        title="Dashboard"
        description={`Overview for ${activeBusiness === "vydhra" ? "Vydhra" : "Ramesys"}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <StatCardItem key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}
