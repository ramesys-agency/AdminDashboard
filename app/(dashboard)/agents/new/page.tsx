"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/common/EntityForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import { toast } from "sonner";

type ReferralSettings = {
  agentCommissionType: "PERCENTAGE" | "FLAT";
  agentCommissionValue: number;
  agentDiscountType: "PERCENTAGE" | "FLAT";
  agentDiscountValue: number;
};

export default function NewAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    code: "",
    commissionType: "PERCENTAGE",
    commissionValue: "10",
    discountType: "PERCENTAGE",
    discountValue: "10",
  });

  // Pre-fill commission/discount from the configurable agent defaults
  const { data: settings } = useApi<ReferralSettings>("/vydhra/referral-settings");
  useEffect(() => {
    if (settings && !prefilled) {
      setPrefilled(true);
      setFormData((prev) => ({
        ...prev,
        commissionType: settings.agentCommissionType,
        commissionValue: String(settings.agentCommissionValue),
        discountType: settings.agentDiscountType,
        discountValue: String(settings.agentDiscountValue),
      }));
    }
  }, [settings, prefilled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post("/vydhra/agents", {
        ...formData,
        commissionValue: parseFloat(formData.commissionValue),
        discountValue: parseFloat(formData.discountValue),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/agents");
      }, 1500);
    } catch {
      toast.error("Failed to create agent. Check if the referral code is unique.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectClass =
    "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all hover:bg-muted/50";

  return (
    <EntityForm
      title="Add New Agent"
      description="Register a new agent and configure their referral and commission settings."
      onSubmit={handleSubmit}
      loading={loading}
      success={success}
      backUrl="/agents"
      submitLabel="Create Agent"
    >
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Vikram Singh"
              required
              value={formData.name}
              onChange={handleChange}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="code"
              className="text-sm font-semibold text-primary"
            >
              Referral Code
            </Label>
            <Input
              id="code"
              name="code"
              placeholder="e.g. VIKRAM20"
              required
              value={formData.code}
              onChange={handleChange}
              className="h-11 font-mono uppercase tracking-wider border-primary/30 focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="vikram@example.com"
              required
              value={formData.email}
              onChange={handleChange}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold">
              Phone Number (Optional)
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+91 XXXXX XXXXX"
              value={formData.phone}
              onChange={handleChange}
              className="h-11"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-bold text-gray-900 mb-1 tracking-tight uppercase">
            Commission Configuration
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            What the agent earns per successful referral. Pre-filled from Referral
            Settings.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="commissionType" className="text-sm font-semibold">
                Type
              </Label>
              <select
                id="commissionType"
                name="commissionType"
                className={selectClass}
                value={formData.commissionType}
                onChange={handleChange}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount ($)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="commissionValue"
                className="text-sm font-semibold"
              >
                Value
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  {formData.commissionType === "PERCENTAGE" ? "%" : "$"}
                </span>
                <Input
                  id="commissionValue"
                  name="commissionValue"
                  type="number"
                  required
                  value={formData.commissionValue}
                  onChange={handleChange}
                  className="h-11 pl-8"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-bold text-gray-900 mb-1 tracking-tight uppercase">
            Customer Discount
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            The discount buyers get when they use this agent&apos;s code at
            checkout (creates the agent&apos;s coupon).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="discountType" className="text-sm font-semibold">
                Type
              </Label>
              <select
                id="discountType"
                name="discountType"
                className={selectClass}
                value={formData.discountType}
                onChange={handleChange}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount ($)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountValue" className="text-sm font-semibold">
                Value
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  {formData.discountType === "PERCENTAGE" ? "%" : "$"}
                </span>
                <Input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  required
                  value={formData.discountValue}
                  onChange={handleChange}
                  className="h-11 pl-8"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </EntityForm>
  );
}
