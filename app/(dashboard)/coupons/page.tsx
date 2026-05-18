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
import { toast } from "sonner";

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
    } catch {
      toast.error("Failed to load coupons. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => {
    fetchData(page, search);
  }, [page, search, fetchData]);

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Coupon Code", accessor: "code" as const },
    {
      header: "Discount",
      accessor: (row: CouponRow) =>
        row.discountType === "PERCENTAGE"
          ? `${row.discountValue}%`
          : `$${row.discountValue.toLocaleString()}`,
    },
    {
      header: "Usage",
      accessor: (row: CouponRow) => `${row.currentUses} / ${row.maxUses || "∞"}`,
    },
    {
      header: "Valid Until",
      accessor: (row: CouponRow) =>
        row.validUntil ? new Date(row.validUntil).toLocaleDateString() : "No expiry",
    },
    {
      header: "Actions",
      accessor: (row: CouponRow) => (
        <Link href={`/coupons/${row.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-muted">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <PageHeader
        title="Coupons"
        description="Manage promotional discount codes and tracking."
        action={
          <Link href="/coupons/new">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Coupon
            </Button>
          </Link>
        }
      />

      {activeBusiness === "vydhra" ? (
        <>
          <TableControls
            onSearch={handleSearch}
            searchValue={search}
            placeholder="Search codes..."
          />
          <DataTable
            data={data}
            columns={columns}
            keyExtractor={(row) => row.id}
            metadata={metadata}
            onPageChange={setPage}
            loading={loading}
          />
        </>
      ) : (
        <div className="p-10 text-center text-muted-foreground border rounded-xl border-dashed bg-muted/20 text-sm">
          Switch to Vydhra to view Coupons.
        </div>
      )}
    </div>
  );
}
