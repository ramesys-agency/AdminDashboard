"use client";

import React, { useTransition, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useBusiness } from "@/context/BusinessContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  CreditCard,
  Ticket,
  MessageSquare,
  Briefcase,
  UserCircle,
  Loader2,
  Settings,
} from "lucide-react";

const vydhraLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Agents", href: "/agents", icon: UserCircle },
  { name: "Courses", href: "/courses", icon: GraduationCap },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Coupons", href: "/coupons", icon: Ticket },
  { name: "Enquiries", href: "/enquiries", icon: MessageSquare },
  { name: "Referral Settings", href: "/referral-settings", icon: Settings },
];

const ramesysLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Projects", href: "/projects", icon: Briefcase },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Enquiries", href: "/enquiries", icon: MessageSquare },
];

export function LeftNavbar() {
  const { activeBusiness } = useBusiness();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending) {
      setPendingHref(null);
    }
  }, [isPending]);

  const handleNavigation = (href: string) => {
    const alreadyActive =
      href === "/dashboard" ? pathname === href : pathname.startsWith(href);
    if (alreadyActive && !isPending) return;
    setPendingHref(href);
    startTransition(() => {
      router.push(href);
    });
  };

  const links = activeBusiness === "vydhra" ? vydhraLinks : ramesysLinks;

  return (
    <aside className="w-60 bg-white dark:bg-gray-950 border-r border-border h-[calc(100vh-3.5rem)] flex flex-col sticky top-14 shrink-0">
      <div className="px-3 py-5 flex-1 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-2">
          Navigation
        </p>
        <nav className="space-y-0.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/dashboard"
                ? pathname === link.href
                : pathname.startsWith(link.href);
            const isLoading = pendingHref === link.href && isPending;

            return (
              <button
                key={link.name}
                onClick={() => handleNavigation(link.href)}
                className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/60 hover:bg-muted hover:text-foreground"
                }`}
              >
                {isLoading ? (
                  <Loader2
                    className={`w-4 h-4 shrink-0 animate-spin ${
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  />
                ) : (
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                )}
                {link.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <span className="text-xs text-muted-foreground capitalize font-medium">
            {activeBusiness}
          </span>
        </div>
      </div>
    </aside>
  );
}
