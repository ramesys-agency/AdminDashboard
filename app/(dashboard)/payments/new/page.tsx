"use client";

import React, { useState, useEffect } from "react";
import { EntityForm } from "@/components/common/EntityForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { apiClient, PaginatedResponse } from "@/lib/api-client";
import { useBusiness } from "@/context/BusinessContext";
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  name: string;
};

type Invoice = {
  id: string;
  amount: number;
};

export default function NewPaymentPage() {
  const { activeBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [formData, setFormData] = useState({
    amount: "",
    status: "PENDING",
    method: "BANK_TRANSFER",
    projectId: "",
    invoiceId: "",
  });

  useEffect(() => {
    async function fetchData() {
      if (activeBusiness !== "ramesys") return;
      try {
        const [projRes, invRes] = await Promise.all([
          apiClient.get<PaginatedResponse<Project>>(
            "/ramesys/projects?limit=50",
          ),
          apiClient.get<PaginatedResponse<Invoice>>(
            "/ramesys/invoices?limit=50",
          ),
        ]);
        setProjects(projRes.data);
        setInvoices(invRes.data);
      } catch (err) {
        console.error("Failed to fetch data for dropdowns:", err);
      }
    }
    fetchData();
  }, [activeBusiness]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Generate a dummy ID
    const newId = `PAY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Store in localStorage for demo purposes
    const newPayment = {
      id: newId,
      amount: parseFloat(formData.amount),
      status: "PENDING",
      method: formData.method,
      projectId: formData.projectId,
      projectName:
        projects.find((p) => p.id === formData.projectId)?.name || "N/A",
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      const existing = JSON.parse(
        localStorage.getItem("mock_payments") || "[]",
      );
      localStorage.setItem(
        "mock_payments",
        JSON.stringify([...existing, newPayment]),
      );
    }

    setTimeout(() => {
      setLoading(false);
      setGeneratedId(newId);
      setSuccess(true);
    }, 800);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (success && generatedId) {
    const paymentLink = `${typeof window !== "undefined" ? window.location.origin : ""}/payments/dummy-checkout/${generatedId}`;
    return (
      <div className="max-w-2xl mx-auto py-16 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-inner">
          <div className="h-10 w-10 border-4 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Payment Link Generated
          </h2>
          <p className="text-muted-foreground text-lg max-w-md">
            The entry has been created in the database with{" "}
            <span className="font-semibold text-amber-600">PENDING</span>{" "}
            status.
          </p>
        </div>

        <div className="w-full bg-muted/30 border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 p-8 rounded-2xl flex flex-col items-center gap-6 shadow-sm">
          <div className="bg-background border px-6 py-4 rounded-xl font-mono text-sm w-full break-all shadow-inner select-all">
            {paymentLink}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button
              className="flex-1 h-12 gap-2 text-lg font-bold"
              onClick={() => {
                navigator.clipboard.writeText(paymentLink);
                alert("Link copied to clipboard!");
              }}
            >
              Copy link
            </Button>
            <Link
              href={`/payments/dummy-checkout/${generatedId}`}
              className="flex-1"
            >
              <Button
                variant="secondary"
                className="w-full h-12 gap-2 text-lg font-bold"
              >
                Go to payment
              </Button>
            </Link>
          </div>
        </div>

        <Link
          href="/payments"
          className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:underline"
        >
          Return to Payments management
        </Link>
      </div>
    );
  }

  return (
    <EntityForm
      title="Generate Payment Link"
      description="Generate a payment link for a project or invoice."
      onSubmit={handleSubmit}
      loading={loading}
      success={success}
      backUrl="/payments"
      submitLabel="Record Payment"
    >
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-semibold">
            Payment Amount (₹)
          </Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            placeholder="15000"
            required
            value={formData.amount}
            onChange={handleChange}
            className="h-11"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold">
              Payment Status
            </Label>
            <select
              id="status"
              name="status"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="method" className="text-sm font-semibold">
              Payment Method
            </Label>
            <select
              id="method"
              name="method"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.method}
              onChange={handleChange}
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Credit/Debit Card</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectId" className="text-sm font-semibold">
            Associated Project (Optional)
          </Label>
          <select
            id="projectId"
            name="projectId"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={formData.projectId}
            onChange={handleChange}
          >
            <option value="">None</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceId" className="text-sm font-semibold">
            Associated Invoice (Optional)
          </Label>
          <select
            id="invoiceId"
            name="invoiceId"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={formData.invoiceId}
            onChange={handleChange}
          >
            <option value="">None</option>
            {invoices.map((i) => (
              <option key={i.id} value={i.id}>
                Invoice #{i.id.slice(-6)} - ₹{i.amount}
              </option>
            ))}
          </select>
        </div>
      </div>
    </EntityForm>
  );
}
