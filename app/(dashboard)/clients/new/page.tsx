"use client";

import React, { useState } from "react";
import { EntityForm } from "@/components/common/EntityForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    console.log("Submitting Client Data:", formData);
    
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/clients");
      }, 1500);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <EntityForm
      title="Add New Client"
      description="Enter the client details to add them to your portfolio."
      onSubmit={handleSubmit}
      loading={loading}
      success={success}
      backUrl="/clients"
      submitLabel="Create Client"
    >
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="John Doe"
            required
            value={formData.name}
            onChange={handleChange}
            className="h-11"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              required
              value={formData.email}
              onChange={handleChange}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="text-sm font-semibold">Company Name</Label>
          <Input
            id="company"
            name="company"
            placeholder="Acme Corp"
            value={formData.company}
            onChange={handleChange}
            className="h-11"
          />
        </div>
      </div>
    </EntityForm>
  );
}
