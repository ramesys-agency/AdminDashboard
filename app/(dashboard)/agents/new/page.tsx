"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/common/EntityForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";

export default function NewAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    code: "",
    commissionType: "PERCENTAGE",
    commissionValue: "10",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post("/vydhra/agents", {
        ...formData,
        commissionValue: parseFloat(formData.commissionValue),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/agents");
      }, 1500);
    } catch (err) {
      console.error("Failed to create agent:", err);
      alert("Failed to create agent. Check if the referral code is unique.");
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
          <h3 className="text-sm font-bold text-gray-900 mb-4 tracking-tight uppercase">
            Commission Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="commissionType" className="text-sm font-semibold">
                Type
              </Label>
              <select
                id="commissionType"
                name="commissionType"
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all hover:bg-muted/50"
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
      </div>
    </EntityForm>
  );
}
