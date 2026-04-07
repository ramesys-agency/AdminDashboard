"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useBusiness } from "../../app/context/BusinessContext";
import { Building2, Bell, Search, User } from "lucide-react";

export function TopNavbar() {
  const { activeBusiness, setActiveBusiness } = useBusiness();
  const router = useRouter();

  const handleSwitchBusiness = (business: "vydhra" | "ramesys") => {
    setActiveBusiness(business);
    router.push("/dashboard");
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        {/* Business Switcher */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => handleSwitchBusiness("vydhra")}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeBusiness === "vydhra"
                ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Vydhra
          </button>
          <button
            onClick={() => handleSwitchBusiness("ramesys")}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeBusiness === "ramesys"
                ? "bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Ramesys
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all w-64"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
