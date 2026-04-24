"use client";

import React, { useState, useEffect } from "react";
import { EntityForm } from "@/components/common/EntityForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { apiClient, PaginatedResponse } from "@/lib/api-client";
import { useBusiness } from "@/context/BusinessContext";

type Project = {
  id: string;
  name: string;
};

export default function NewInvoicePage() {
  const router = useRouter();
  const { activeBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const [formData, setFormData] = useState({
    projectId: "",
    amount: "",
    status: "PENDING",
    dueDate: "",
    invoiceLink: "",
  });

  useEffect(() => {
    async function fetchProjects() {
      if (activeBusiness !== "ramesys") return;
      try {
        const res = await apiClient.get<PaginatedResponse<Project>>(
          "/ramesys/projects?limit=50",
        );
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch projects for dropdown:", err);
      }
    }
    fetchProjects();
  }, [activeBusiness]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting Invoice Data:", formData);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/invoices");
      }, 1500);
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <EntityForm
      title="Generate New Invoice"
      description="Create a formal payment request for a project."
      onSubmit={handleSubmit}
      loading={loading}
      success={success}
      backUrl="/invoices"
      submitLabel="Generate Invoice"
    >
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="projectId" className="text-sm font-semibold">
            Project
          </Label>
          <select
            id="projectId"
            name="projectId"
            required
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={formData.projectId}
            onChange={handleChange}
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-semibold">
              Invoice Amount ($)
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="25000"
              required
              value={formData.amount}
              onChange={handleChange}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold">
              Status
            </Label>
            <select
              id="status"
              name="status"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate" className="text-sm font-semibold">
            Due Date
          </Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            required
            value={formData.dueDate}
            onChange={handleChange}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceLink" className="text-sm font-semibold">
            External Invoice Link (Optional)
          </Label>
          <Input
            id="invoiceLink"
            name="invoiceLink"
            placeholder="https://billing.provider.com/inv/123"
            value={formData.invoiceLink}
            onChange={handleChange}
            className="h-11"
          />
        </div>
      </div>
    </EntityForm>
  );
}
