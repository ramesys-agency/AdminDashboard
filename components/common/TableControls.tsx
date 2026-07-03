import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TableControlsProps {
  onSearch: (value: string) => void;
  searchValue: string;
  placeholder?: string;
  children?: React.ReactNode;
}

export function TableControls({
  onSearch,
  searchValue,
  placeholder = "Search...",
  children,
}: TableControlsProps) {
  const [value, setValue] = useState(searchValue);
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  // Debounce so we don't fire an API request per keystroke
  useEffect(() => {
    if (value === searchValue) return;
    const timer = setTimeout(() => onSearchRef.current(value), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pl-9 h-9 bg-background border-border/60 focus-visible:ring-primary/30"
        />
      </div>
      {children && (
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {children}
        </div>
      )}
    </div>
  );
}
