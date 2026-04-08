import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TableControlsProps {
  onSearch: (value: string) => void;
  searchValue: string;
  placeholder?: string;
  children?: React.ReactNode; // For extra filters
}

export function TableControls({
  onSearch,
  searchValue,
  placeholder = "Search...",
  children,
}: TableControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          defaultValue={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        {children}
      </div>
    </div>
  );
}
