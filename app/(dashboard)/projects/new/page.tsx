"use client";

import React, { useState, useEffect } from "react";
import { EntityForm } from "@/components/common/EntityForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { apiClient, PaginatedResponse } from "@/lib/api-client";
import { useBusiness } from "@/context/BusinessContext";

type Client = {
  id: string;
  name: string;
};

export default function NewProjectPage() {
  const router = useRouter();
  const { activeBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [fetchingClients, setFetchingClients] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    clientId: "",
    status: "PENDING",
    budget: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    async function fetchClients() {
      if (activeBusiness !== "ramesys") return;
      try {
        const res = await apiClient.get<PaginatedResponse<Client>>(
          "/ramesys/clients?limit=100",
        );
        setClients(res.data);
      } catch (err) {
        console.error("Failed to fetch clients for dropdown:", err);
      } finally {
        setFetchingClients(false);
      }
    }
    fetchClients();
  }, [activeBusiness]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    console.log("Submitting Project Data:", formData);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/projects");
      }, 1500);
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <EntityForm
      title="Create New Project"
      description="Initialize a new project and assign it to a client."
      onSubmit={handleSubmit}
      loading={loading}
      success={success}
      backUrl="/projects"
      submitLabel="Create Project"
    >
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold">
            Project Name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="E-commerce Redesign"
            required
            value={formData.name}
            onChange={handleChange}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold">
            Description
          </Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Briefly describe the project scope..."
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="clientId" className="text-sm font-semibold">
              Client
            </Label>
            <select
              id="clientId"
              name="clientId"
              required
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.clientId}
              onChange={handleChange}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
              {fetchingClients && <option disabled>Loading clients...</option>}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold">
              Initial Status
            </Label>
            <select
              id="status"
              name="status"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-semibold">
              Start Date
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-semibold">
              End Date (Estimated)
            </Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget" className="text-sm font-semibold">
            Project Budget ($)
          </Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            placeholder="50000"
            value={formData.budget}
            onChange={handleChange}
            className="h-11"
          />
        </div>
      </div>
    </EntityForm>
  );
}
