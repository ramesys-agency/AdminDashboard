"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { TableControls } from "@/components/common/TableControls";
import { useBusiness } from "@/context/BusinessContext";
import { apiClient, PaginatedResponse, PaginationMetadata } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";

type CouponRow = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  currentUses: number;
  maxUses: number | null;
  validUntil: string | null;
  createdAt: string;
};

export default function CouponsPage() {
  const { activeBusiness } = useBusiness();
  const [data, setData] = useState<CouponRow[]>([]);
  const [metadata, setMetadata] = useState<PaginationMetadata | undefined>();
  const [loading, setLoading] = useState(true);
  
  // Query state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async (p: number, q: string) => {
    if (activeBusiness !== "vydhra") return;
    
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: p.toString(),
        limit: "10",
        ...(q && { q }),
      });
      
      const res = await apiClient.get<PaginatedResponse<CouponRow>>(`/vydhra/coupons?${query}`);
      setData(res.data);
      setMetadata(res.metadata);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(page, search);
    }, 300); // Simple debounce
    
    return () => clearTimeout(timer);
  }, [page, search, fetchData]);

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Coupon Code", accessor: "code" as const },
    { header: "Discount", accessor: (row: CouponRow) => row.discountType === "PERCENTAGE" ? `${row.discountValue}%` : `₹${row.discountValue.toLocaleString()}` },
    { header: "Usage", accessor: (row: CouponRow) => `${row.currentUses} / ${row.maxUses || "∞"}` },
    { header: "Valid Until", accessor: (row: CouponRow) => row.validUntil ? new Date(row.validUntil).toLocaleDateString() : "N/A" },
    { 
      header: "Actions", 
      accessor: (row: CouponRow) => (
        <Link href={`/coupons/${row.id}`}>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      )
    },
  ];

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <PageHeader
        title="Coupons"
        description="Manage promotional discount codes and tracking."
        action={
          <Link href="/coupons/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Coupon
            </Button>
          </Link>
        }
      />

      {activeBusiness === "vydhra" && (
        <TableControls 
          onSearch={handleSearch} 
          searchValue={search}
          placeholder="Search codes..."
        />
      )}
      
      {activeBusiness === "vydhra" ? (
        loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse border rounded-xl">Loading coupons...</div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            keyExtractor={(row) => row.id}
            metadata={metadata}
            onPageChange={setPage}
          />
        )
      ) : (
        <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed bg-muted/20">
          Switch to Vydhra to view Coupons.
        </div>
      )}
    </div>
  );
}
