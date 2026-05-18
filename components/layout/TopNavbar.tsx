"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useBusiness } from "@/context/BusinessContext";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopNavbar() {
  const { activeBusiness, setActiveBusiness } = useBusiness();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSwitchBusiness = (business: "vydhra" | "ramesys") => {
    setActiveBusiness(business);
    router.push("/dashboard");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  return (
    <header className="h-14 border-b border-border/60 bg-white dark:bg-gray-950 flex items-center justify-between px-5 sticky top-0 z-20 w-full">
      <div className="flex items-center gap-3">
        <span className="text-base font-bold tracking-tight text-foreground">
          Admin
        </span>
        <span className="text-border/80">·</span>

        {/* Business Switcher */}
        <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => handleSwitchBusiness("vydhra")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeBusiness === "vydhra"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Vydhra
          </button>
          <button
            onClick={() => handleSwitchBusiness("ramesys")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeBusiness === "ramesys"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Ramesys
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold hover:bg-primary/20 transition-all outline-none cursor-pointer">
            {initials}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold leading-none">{user?.name || "Admin User"}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-0.5">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
