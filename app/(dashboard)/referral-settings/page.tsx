"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Users,
  UserCircle,
  Percent,
  HandCoins,
  Ticket,
  Save,
} from "lucide-react";
import { toast } from "sonner";

type RateType = "PERCENTAGE" | "FLAT";

type ReferralSettings = {
  id: string;
  studentReferralEnabled: boolean;
  studentDiscountType: RateType;
  studentDiscountValue: number;
  studentCommissionType: RateType;
  studentCommissionValue: number;
  agentDiscountType: RateType;
  agentDiscountValue: number;
  agentCommissionType: RateType;
  agentCommissionValue: number;
  updatedAt: string;
};

type FormState = {
  studentReferralEnabled: boolean;
  studentDiscountType: RateType;
  studentDiscountValue: string;
  studentCommissionType: RateType;
  studentCommissionValue: string;
  agentDiscountType: RateType;
  agentDiscountValue: string;
  agentCommissionType: RateType;
  agentCommissionValue: string;
};

function RateFields({
  label,
  hint,
  type,
  value,
  onTypeChange,
  onValueChange,
}: {
  label: string;
  hint: string;
  type: RateType;
  value: string;
  onTypeChange: (t: RateType) => void;
  onValueChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="flex gap-3">
        <select
          className="flex h-11 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all hover:bg-muted/50"
          value={type}
          onChange={(e) => onTypeChange(e.target.value as RateType)}
        >
          <option value="PERCENTAGE">Percentage (%)</option>
          <option value="FLAT">Flat Amount ($)</option>
        </select>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            {type === "PERCENTAGE" ? "%" : "$"}
          </span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="h-11 pl-8"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export default function ReferralSettingsPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    data: settings,
    isLoading: loading,
    mutate,
  } = useApi<ReferralSettings>("/vydhra/referral-settings", {
    onError: () => toast.error("Failed to load referral settings."),
  });

  useEffect(() => {
    if (settings && !form) {
      setForm({
        studentReferralEnabled: settings.studentReferralEnabled,
        studentDiscountType: settings.studentDiscountType,
        studentDiscountValue: String(settings.studentDiscountValue),
        studentCommissionType: settings.studentCommissionType,
        studentCommissionValue: String(settings.studentCommissionValue),
        agentDiscountType: settings.agentDiscountType,
        agentDiscountValue: String(settings.agentDiscountValue),
        agentCommissionType: settings.agentCommissionType,
        agentCommissionValue: String(settings.agentCommissionValue),
      });
    }
  }, [settings, form]);

  const handleSave = async () => {
    if (!form) return;

    const numbers = {
      studentDiscountValue: parseFloat(form.studentDiscountValue),
      studentCommissionValue: parseFloat(form.studentCommissionValue),
      agentDiscountValue: parseFloat(form.agentDiscountValue),
      agentCommissionValue: parseFloat(form.agentCommissionValue),
    };

    for (const [key, value] of Object.entries(numbers)) {
      if (isNaN(value) || value < 0) {
        toast.error("Invalid Value", {
          description: "All discount and earning values must be non-negative numbers.",
        });
        return;
      }
      const typeKey = key.replace("Value", "Type") as keyof FormState;
      if (form[typeKey] === "PERCENTAGE" && value > 100) {
        toast.error("Invalid Percentage", {
          description: "Percentage values cannot exceed 100%.",
        });
        return;
      }
    }

    setSaving(true);
    try {
      await apiClient.patch("/vydhra/referral-settings", {
        studentReferralEnabled: form.studentReferralEnabled,
        studentDiscountType: form.studentDiscountType,
        studentCommissionType: form.studentCommissionType,
        agentDiscountType: form.agentDiscountType,
        agentCommissionType: form.agentCommissionType,
        ...numbers,
      });
      toast.success("Settings Saved", {
        description: "Referral settings have been updated.",
      });
      mutate();
    } catch (error: unknown) {
      toast.error("Save Failed", {
        description:
          error instanceof Error ? error.message : "Failed to save settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Referral Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure default discounts and earnings for student referrals and agents.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Student referral program */}
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Student Referral Program
                <Badge
                  variant={form.studentReferralEnabled ? "default" : "secondary"}
                  className="ml-1"
                >
                  {form.studentReferralEnabled ? "Active" : "Disabled"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Every student gets a personal referral code. When a friend enrolls
                with it, the friend gets the discount and the student earns a bonus.
              </CardDescription>
            </div>
            <Switch
              checked={form.studentReferralEnabled}
              onCheckedChange={(checked: boolean) =>
                setForm({ ...form, studentReferralEnabled: checked })
              }
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <RateFields
            label="Discount for the referred friend"
            hint="Applied at checkout when a valid student referral code is entered. Flat amounts are in USD."
            type={form.studentDiscountType}
            value={form.studentDiscountValue}
            onTypeChange={(t) => setForm({ ...form, studentDiscountType: t })}
            onValueChange={(v) => setForm({ ...form, studentDiscountValue: v })}
          />
          <RateFields
            label="Earning for the referring student"
            hint="Credited (in USD) to the referrer once the friend's payment completes. Per-student overrides can be set on the student page."
            type={form.studentCommissionType}
            value={form.studentCommissionValue}
            onTypeChange={(t) => setForm({ ...form, studentCommissionType: t })}
            onValueChange={(v) => setForm({ ...form, studentCommissionValue: v })}
          />
        </CardContent>
      </Card>

      {/* Agent defaults */}
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-emerald-600" />
            Agent Defaults
          </CardTitle>
          <CardDescription>
            Pre-filled when creating a new agent. Existing agents keep their own
            commission and coupon discount — edit those on the agent and coupon pages.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <RateFields
            label="Default customer discount"
            hint="Used for the agent's coupon when a new agent is created."
            type={form.agentDiscountType}
            value={form.agentDiscountValue}
            onTypeChange={(t) => setForm({ ...form, agentDiscountType: t })}
            onValueChange={(v) => setForm({ ...form, agentDiscountValue: v })}
          />
          <RateFields
            label="Default agent commission"
            hint="Used as the commission setting when a new agent is created."
            type={form.agentCommissionType}
            value={form.agentCommissionValue}
            onTypeChange={(t) => setForm({ ...form, agentCommissionType: t })}
            onValueChange={(v) => setForm({ ...form, agentCommissionValue: v })}
          />
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="border-none shadow-sm bg-blue-50/40 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex gap-3">
              <Ticket className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                Student referral codes work in the same checkout field as coupon
                and agent codes.
              </p>
            </div>
            <div className="flex gap-3">
              <Percent className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                Changing these defaults applies immediately to every student
                without a personal override.
              </p>
            </div>
            <div className="flex gap-3">
              <HandCoins className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                Student earnings and payouts are tracked on each student&apos;s
                page, just like agent payouts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
