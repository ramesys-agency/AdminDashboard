"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/common/EntityForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post("/vydhra/courses", {
        ...formData,
        price: parseFloat(formData.price),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/courses");
      }, 1500);
    } catch (err) {
      console.error("Failed to create course:", err);
      alert("Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <EntityForm
      title="Create New Course"
      description="List a new course on the platform, set pricing, and provide a curriculum overview."
      onSubmit={handleSubmit}
      loading={loading}
      success={success}
      backUrl="/courses"
      submitLabel="Publish Course"
    >
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold">Course Title</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Master React & Next.js"
            required
            value={formData.name}
            onChange={handleChange}
            className="h-11 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="What will students learn in this course?"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            className="resize-none shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-semibold">Price (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="4999"
                required
                value={formData.price}
                onChange={handleChange}
                className="h-11 pl-8 shadow-sm"
              />
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-dashed">
              Ensure the price accounts for all taxes and platform fees.
            </p>
          </div>
        </div>
      </div>
    </EntityForm>
  );
}
