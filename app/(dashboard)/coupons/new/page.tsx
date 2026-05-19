"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/common/EntityForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD — US Dollar" },
  { code: "INR", symbol: "₹", label: "INR — Indian Rupee" },
  { code: "EUR", symbol: "€", label: "EUR — Euro" },
  { code: "GBP", symbol: "£", label: "GBP — British Pound" },
  { code: "AED", symbol: "د.إ", label: "AED — UAE Dirham" },
];

type DiscountRow = {
  currency: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: string;
};

const defaultDiscounts: DiscountRow[] = [
  { currency: "USD", discountType: "PERCENTAGE", discountValue: "10" },
  { currency: "INR", discountType: "PERCENTAGE", discountValue: "10" },
];

export default function NewCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [code, setCode] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [discounts, setDiscounts] = useState<DiscountRow[]>(defaultDiscounts);

  const updateDiscount = (i: number, field: keyof DiscountRow, value: string) => {
    setDiscounts((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const removeDiscount = (i: number) => setDiscounts((prev) => prev.filter((_, idx) => idx !== i));

  const addDiscount = () => {
    const usedCodes = discounts.map((d) => d.currency);
    const next = SUPPORTED_CURRENCIES.find((c) => !usedCodes.includes(c.code));
    if (next) setDiscounts((prev) => [...prev, { currency: next.code, discountType: "PERCENTAGE", discountValue: "10" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { toast.error("Coupon code is required."); return; }
    const payload = discounts
      .filter((d) => d.discountValue.trim() !== "")
      .map((d) => ({ currency: d.currency, discountType: d.discountType, discountValue: parseFloat(d.discountValue) }));
    if (payload.length === 0) { toast.error("Add at least one currency discount."); return; }

    setLoading(true);
    try {
      await apiClient.post("/vydhra/coupons", {
        code: code.trim().toUpperCase(),
        discounts: payload,
        maxUses: maxUses ? parseInt(maxUses) : null,
        validUntil: validUntil || null,
      });
      setSuccess(true);
      setTimeout(() => router.push("/coupons"), 1500);
    } catch {
      toast.error("Failed to create coupon. Check if the code is unique.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <EntityForm
      title="Generate New Coupon"
      description="Create a discount code with per-currency discounts for marketing campaigns or agent tracking."
      onSubmit={handleSubmit}
      loading={loading}
      success={success}
      backUrl="/coupons"
      submitLabel="Activate Coupon"
    >
      <div className="grid gap-6">
        {/* Code */}
        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-semibold text-primary">
            Coupon Code
          </Label>
          <Input
            id="code"
            placeholder="e.g. SUMMER25"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="h-11 font-mono uppercase tracking-widest border-primary/20 focus:border-primary shadow-sm"
          />
        </div>

        {/* Per-currency discounts */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Discounts per Currency</Label>
          <div className="space-y-2">
            {discounts.map((row, i) => {
              const usedCodes = discounts.map((d) => d.currency);
              const available = SUPPORTED_CURRENCIES.filter(
                (c) => c.code === row.currency || !usedCodes.includes(c.code)
              );
              const sym = SUPPORTED_CURRENCIES.find((c) => c.code === row.currency)?.symbol ?? row.currency;
              return (
                <div key={i} className="flex gap-2 items-center">
                  <select
                    value={row.currency}
                    onChange={(e) => updateDiscount(i, "currency", e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-40 shrink-0"
                  >
                    {available.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <select
                    value={row.discountType}
                    onChange={(e) => updateDiscount(i, "discountType", e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-36 shrink-0"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount</option>
                  </select>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                      {row.discountType === "PERCENTAGE" ? "%" : sym}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={row.discountValue}
                      onChange={(e) => updateDiscount(i, "discountValue", e.target.value)}
                      className="h-10 pl-8"
                    />
                  </div>
                  {discounts.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                      onClick={() => removeDiscount(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          {discounts.length < SUPPORTED_CURRENCIES.length && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/5 px-2 gap-1"
              onClick={addDiscount}
            >
              <Plus className="h-3.5 w-3.5" />
              Add currency
            </Button>
          )}
        </div>

        {/* Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="maxUses" className="text-sm font-semibold">
              Usage Limit <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </Label>
            <Input
              id="maxUses"
              type="number"
              placeholder="Unlimited if empty"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="h-11 shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="validUntil" className="text-sm font-semibold">
              Expiry Date <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </Label>
            <Input
              id="validUntil"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="h-11 shadow-sm"
            />
          </div>
        </div>
      </div>
    </EntityForm>
  );
}
