"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/common/EntityForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post("/vydhra/students", formData);
      setSuccess(true);
      setTimeout(() => {
        router.push("/students");
      }, 1500);
    } catch (err) {
      console.error("Failed to create student:", err);
      alert("Failed to create student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <EntityForm
      title="Add New Student"
      description="Create a new student profile and record their contact information."
      onSubmit={handleSubmit}
      loading={loading}
      success={success}
      backUrl="/students"
      submitLabel="Create Student"
    >
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Rahul Sharma"
            required
            value={formData.name}
            onChange={handleChange}
            className="h-11 shadow-sm focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="rahul@example.com"
              required
              value={formData.email}
              onChange={handleChange}
              className="h-11 shadow-sm focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold">Phone Number (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+91 XXXXX XXXXX"
              value={formData.phone}
              onChange={handleChange}
              className="h-11 shadow-sm focus:ring-primary/20"
            />
          </div>
        </div>
      </div>
    </EntityForm>
  );
}
