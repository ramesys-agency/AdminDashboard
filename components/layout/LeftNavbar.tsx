"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBusiness } from "../../app/context/BusinessContext";
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

  const links = activeBusiness === "vydhra" ? vydhraLinks : ramesysLinks;

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-[calc(100vh-4rem)] flex flex-col sticky top-16">
      <div className="p-6">
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
          Menu
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? activeBusiness === "vydhra" 
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" 
                      : "bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "" : "text-gray-400 dark:text-gray-500"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
