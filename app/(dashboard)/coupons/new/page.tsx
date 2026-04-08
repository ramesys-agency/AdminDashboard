"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/common/EntityForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";

export default function NewCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "10",
    maxUses: "",
    validUntil: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post("/vydhra/coupons", {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        validUntil: formData.validUntil || null,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/coupons");
      }, 1500);
    } catch (err) {
      console.error("Failed to create coupon:", err);
      alert("Failed to create coupon. Check if the code is unique.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <EntityForm
      title="Generate New Coupon"
      description="Create a discount code for marketing campaigns or agent tracking."
      onSubmit={handleSubmit}
      loading={loading}
      success={success}
      backUrl="/coupons"
      submitLabel="Active Coupon"
    >
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-semibold text-primary">Coupon Code</Label>
          <Input
            id="code"
            name="code"
            placeholder="e.g. SUMMER25"
            required
            value={formData.code}
            onChange={handleChange}
            className="h-11 font-mono uppercase tracking-widest border-primary/20 focus:border-primary shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="discountType" className="text-sm font-semibold">Discount Type</Label>
            <select
              id="discountType"
              name="discountType"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all hover:bg-muted/50"
              value={formData.discountType}
              onChange={handleChange}
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FLAT">Flat Amount (₹)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountValue" className="text-sm font-semibold">Discount Value</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                {formData.discountType === "PERCENTAGE" ? "%" : "₹"}
              </span>
              <Input
                id="discountValue"
                name="discountValue"
                type="number"
                required
                value={formData.discountValue}
                onChange={handleChange}
                className="h-11 pl-8 shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="maxUses" className="text-sm font-semibold">Usage Limit (Optional)</Label>
            <Input
              id="maxUses"
              name="maxUses"
              type="number"
              placeholder="Unlimited if empty"
              value={formData.maxUses}
              onChange={handleChange}
              className="h-11 shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="validUntil" className="text-sm font-semibold">Expiry Date (Optional)</Label>
            <Input
              id="validUntil"
              name="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={handleChange}
              className="h-11 shadow-sm"
            />
          </div>
        </div>
      </div>
    </EntityForm>
  );
}
