"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { EntityForm } from "@/components/common/EntityForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import {
  ImagePlus,
  X,
  Plus,
  Loader2,
  Upload,
  BookOpen,
  DollarSign,
  Code2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const SUPPORTED_CURRENCIES: { code: string; symbol: string; label: string }[] = [
  { code: "USD", symbol: "$", label: "USD — US Dollar" },
  { code: "INR", symbol: "₹", label: "INR — Indian Rupee" },
  { code: "EUR", symbol: "€", label: "EUR — Euro" },
  { code: "GBP", symbol: "£", label: "GBP — British Pound" },
  { code: "AED", symbol: "د.إ", label: "AED — UAE Dirham" },
];

function currencySymbol(code: string): string {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DETAILS_TEMPLATE = {
  slug: "",
  title: "",
  subtitle: "",
  image: "",
  heroImage: "",
  category: "",
  level: "Beginner",
  duration: "",
  description: "",
  liveInteractiveClasses: true,
  features: [""],
  requirements: [""],
  tools: [{ icon: "", name: "" }],
  projects: [{ icon: "", title: "", description: "" }],
  curriculum: [
    {
      id: "01",
      meta: "Week 1",
      title: "",
      isOpen: true,
      outcome: "",
      practice: "",
      lessons: [{ type: "video", title: "" }],
    },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
      <div className="p-2 bg-primary/[0.08] rounded-lg mt-0.5">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

function ListFieldEditor({
  label,
  values,
  placeholder,
  onChange,
  addLabel,
}: {
  label: string;
  values: string[];
  placeholder: string;
  onChange: (vals: string[]) => void;
  addLabel: string;
}) {
  const update = (i: number, val: string) => {
    const next = [...values];
    next[i] = val;
    onChange(next);
  };
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="h-10 text-sm"
            />
            {values.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                onClick={() => remove(i)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/5 px-2 gap-1"
        onClick={() => onChange([...values, ""])}
      >
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CourseFormProps {
  mode: "create" | "edit";
  courseId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CourseForm({ mode, courseId }: CourseFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Required fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pricing, setPricing] = useState<{ currency: string; amount: string }[]>([
    { currency: "USD", amount: "" },
    { currency: "INR", amount: "" },
  ]);

  // Details section
  const [isJsonMode, setIsJsonMode] = useState(true);
  const [jsonText, setJsonText] = useState(
    JSON.stringify(DETAILS_TEMPLATE, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [detailsForm, setDetailsForm] = useState({
    level: "Beginner",
    duration: "",
    category: "",
    subtitle: "",
    features: [""],
    requirements: [""],
  });

  // Thumbnail image
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hero image
  const [heroImageUploading, setHeroImageUploading] = useState(false);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  // ── Load existing course in edit mode ──────────────────────────────────────

  useEffect(() => {
    if (!isEdit || !courseId) return;
    setFetchLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiClient.get<any>(`/vydhra/courses/${courseId}`)
      .then((course) => {
        setName(course.name ?? "");
        setDescription(course.description ?? "");
        if (course.pricing && typeof course.pricing === "object") {
          const loaded = Object.entries(course.pricing as Record<string, number>).map(
            ([currency, amount]) => ({ currency, amount: String(amount) })
          );
          if (loaded.length > 0) setPricing(loaded);
        }

        const details = course.details ?? {};
        setJsonText(JSON.stringify(
          Object.keys(details).length ? details : DETAILS_TEMPLATE,
          null,
          2
        ));
        setJsonError(null);

        if (details.image) {
          setImageUrl(details.image);
          setImagePreview(details.image);
        }
        if (details.heroImage) {
          setHeroImageUrl(details.heroImage);
          setHeroImagePreview(details.heroImage);
        }
      })
      .catch(() => toast.error("Failed to load course details."))
      .finally(() => setFetchLoading(false));
  }, [isEdit, courseId]);

  // ── Mode switching ──────────────────────────────────────────────────────────

  const switchToForm = () => {
    if (jsonError) {
      toast.error("Fix JSON errors before switching to form mode.");
      return;
    }
    try {
      const parsed = JSON.parse(jsonText);
      setDetailsForm({
        level: parsed.level ?? "Beginner",
        duration: parsed.duration ?? "",
        category: parsed.category ?? "",
        subtitle: parsed.subtitle ?? "",
        features: Array.isArray(parsed.features) && parsed.features.length ? parsed.features : [""],
        requirements: Array.isArray(parsed.requirements) && parsed.requirements.length ? parsed.requirements : [""],
      });
      if (parsed.image) {
        setImageUrl(parsed.image);
        setImagePreview(parsed.image);
      }
      if (parsed.heroImage) {
        setHeroImageUrl(parsed.heroImage);
        setHeroImagePreview(parsed.heroImage);
      }
      setIsJsonMode(false);
    } catch {
      toast.error("Invalid JSON — cannot switch to form mode.");
    }
  };

  const switchToJson = () => {
    const details: Record<string, unknown> = { ...DETAILS_TEMPLATE };
    if (imageUrl) details.image = imageUrl;
    if (heroImageUrl) details.heroImage = heroImageUrl;
    details.level = detailsForm.level;
    if (detailsForm.duration) details.duration = detailsForm.duration;
    if (detailsForm.category) details.category = detailsForm.category;
    if (detailsForm.subtitle) details.subtitle = detailsForm.subtitle;
    details.features = detailsForm.features.filter((s) => s.trim());
    details.requirements = detailsForm.requirements.filter((s) => s.trim());
    setJsonText(JSON.stringify(details, null, 2));
    setJsonError(null);
    setIsJsonMode(true);
  };

  // ── JSON validation ─────────────────────────────────────────────────────────

  const handleJsonChange = (val: string) => {
    setJsonText(val);
    if (!val.trim()) { setJsonError(null); return; }
    try {
      JSON.parse(val);
      setJsonError(null);
    } catch (e: unknown) {
      setJsonError(e instanceof SyntaxError ? e.message : "Invalid JSON");
    }
  };

  // ── Image upload ────────────────────────────────────────────────────────────

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setImageUploading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/image", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const { url } = (await res.json()) as { url: string };
      setImageUrl(url);
      if (isJsonMode) {
        setJsonText((prev) => {
          try {
            const parsed = JSON.parse(prev);
            parsed.image = url;
            return JSON.stringify(parsed, null, 2);
          } catch { return prev; }
        });
      }
      toast.success("Image uploaded.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setImagePreview(null);
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (isJsonMode) {
      setJsonText((prev) => {
        try {
          const parsed = JSON.parse(prev);
          parsed.image = "";
          return JSON.stringify(parsed, null, 2);
        } catch { return prev; }
      });
    }
  };

  // ── Hero image upload ───────────────────────────────────────────────────────

  const handleHeroImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setHeroImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setHeroImageUploading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/image", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const { url } = (await res.json()) as { url: string };
      setHeroImageUrl(url);
      if (isJsonMode) {
        setJsonText((prev) => {
          try {
            const parsed = JSON.parse(prev);
            parsed.heroImage = url;
            return JSON.stringify(parsed, null, 2);
          } catch { return prev; }
        });
      }
      toast.success("Hero image uploaded.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setHeroImagePreview(null);
    } finally {
      setHeroImageUploading(false);
    }
  };

  const removeHeroImage = () => {
    setHeroImageUrl("");
    setHeroImagePreview(null);
    if (heroFileInputRef.current) heroFileInputRef.current.value = "";
    if (isJsonMode) {
      setJsonText((prev) => {
        try {
          const parsed = JSON.parse(prev);
          parsed.heroImage = "";
          return JSON.stringify(parsed, null, 2);
        } catch { return prev; }
      });
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUploading || heroImageUploading) {
      toast.error("Please wait for the image to finish uploading.");
      return;
    }
    if (!name.trim()) { toast.error("Course title is required."); return; }
    const pricingPayload = pricing
      .filter((p) => p.amount.trim() !== "")
      .map((p) => ({ currency: p.currency, amount: parseFloat(p.amount) }));
    if (pricingPayload.length === 0) { toast.error("At least one currency price is required."); return; }

    let details: Record<string, unknown> | null = null;

    if (isJsonMode) {
      if (jsonError) { toast.error("Fix JSON errors before submitting."); return; }
      try {
        const parsed = JSON.parse(jsonText);
        details = Object.keys(parsed).length > 0 ? parsed : null;
      } catch {
        toast.error("Invalid JSON — cannot submit.");
        return;
      }
    } else {
      const d: Record<string, unknown> = {};
      if (imageUrl) d.image = imageUrl;
      if (heroImageUrl) d.heroImage = heroImageUrl;
      if (detailsForm.level) d.level = detailsForm.level;
      if (detailsForm.duration) d.duration = detailsForm.duration;
      if (detailsForm.category) d.category = detailsForm.category;
      if (detailsForm.subtitle) d.subtitle = detailsForm.subtitle;
      const features = detailsForm.features.filter((s) => s.trim());
      const requirements = detailsForm.requirements.filter((s) => s.trim());
      if (features.length) d.features = features;
      if (requirements.length) d.requirements = requirements;
      details = Object.keys(d).length > 0 ? d : null;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      pricing: pricingPayload,
      details,
    };

    setLoading(true);
    try {
      if (isEdit && courseId) {
        await apiClient.put(`/vydhra/courses/${courseId}`, payload);
        toast.success("Course updated successfully.");
      } else {
        await apiClient.post("/vydhra/courses", payload);
      }
      setSuccess(true);
      setTimeout(() => router.push("/courses"), 1500);
    } catch {
      toast.error(
        isEdit ? "Failed to update course." : "Failed to create course."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Loading skeleton (edit mode fetching) ─────────────────────────────────

  if (fetchLoading) {
    return (
      <EntityForm
        title="Edit Course"
        onSubmit={(e) => e.preventDefault()}
        loading={false}
        backUrl="/courses"
        submitLabel="Save Changes"
      >
        <div className="space-y-6 animate-pulse">
          {[200, 120, 80].map((w, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-100 rounded-full" style={{ width: w }} />
              <div className="h-11 bg-gray-100 rounded-lg w-full" />
            </div>
          ))}
          <div className="h-48 bg-gray-100 rounded-xl w-full" />
        </div>
      </EntityForm>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <EntityForm
      title={isEdit ? "Edit Course" : "Create New Course"}
      description={
        isEdit
          ? "Update course details, pricing, and curriculum."
          : "List a new course on the platform with full details, pricing, and curriculum."
      }
      onSubmit={handleSubmit}
      loading={loading || imageUploading || heroImageUploading}
      success={success}
      backUrl="/courses"
      submitLabel={isEdit ? "Save Changes" : "Publish Course"}
    >
      {/* ── Basic Info ───────────────────────────── */}
      <div className="space-y-5">
        <SectionHeading
          icon={BookOpen}
          title="Basic Information"
          description="Core fields required to publish the course."
        />
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold">
            Course Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. SQL Job-Ready Bootcamp"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Briefly describe what this course covers and who it's for…"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none"
          />
        </div>
      </div>

      {/* ── Pricing ─────────────────────────────── */}
      <div className="space-y-4">
        <SectionHeading
          icon={DollarSign}
          title="Pricing"
          description="Set prices per currency. At least one is required. Add more currencies as needed."
        />
        <div className="space-y-2">
          {pricing.map((row, i) => {
            const usedCodes = pricing.map((p) => p.currency);
            const available = SUPPORTED_CURRENCIES.filter(
              (c) => c.code === row.currency || !usedCodes.includes(c.code)
            );
            return (
              <div key={i} className="flex gap-2 items-center">
                <select
                  value={row.currency}
                  onChange={(e) => {
                    const next = [...pricing];
                    next[i] = { ...next[i], currency: e.target.value };
                    setPricing(next);
                  }}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-44 shrink-0"
                >
                  {available.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                    {currencySymbol(row.currency)}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={row.amount}
                    onChange={(e) => {
                      const next = [...pricing];
                      next[i] = { ...next[i], amount: e.target.value };
                      setPricing(next);
                    }}
                    className="h-10 pl-8"
                  />
                </div>
                {pricing.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                    onClick={() => setPricing(pricing.filter((_, idx) => idx !== i))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        {pricing.length < SUPPORTED_CURRENCIES.length && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/5 px-2 gap-1"
            onClick={() => {
              const usedCodes = pricing.map((p) => p.currency);
              const next = SUPPORTED_CURRENCIES.find((c) => !usedCodes.includes(c.code));
              if (next) setPricing([...pricing, { currency: next.code, amount: "" }]);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add currency
          </Button>
        )}
      </div>

      {/* ── Course Images ─────────────────────────── */}
      <div className="space-y-4">
        <SectionHeading
          icon={ImagePlus}
          title="Course Images"
          description="Thumbnail and Hero image — both 800×800 px, max 5 MB each."
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleImageSelect}
        />
        <input
          ref={heroFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleHeroImageSelect}
        />
        <div className="grid grid-cols-2 gap-4">
          {/* Thumbnail */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-600">Thumbnail <span className="text-gray-400 font-normal">800×800 px</span></p>
            {imagePreview || imageUrl ? (
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                <Image
                  src={imagePreview || imageUrl}
                  alt="Course thumbnail"
                  fill
                  className="object-cover"
                />
                {imageUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
                {!imageUploading && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-1.5">
                      <Button type="button" size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-3 w-3" /> Change
                      </Button>
                      <Button type="button" size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={removeImage}>
                        <X className="h-3 w-3" /> Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 group"
              >
                <div className="p-2.5 rounded-full bg-gray-100 group-hover:bg-primary/10 transition-colors">
                  <ImagePlus className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">Click to upload</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">JPEG, PNG, WebP</p>
                </div>
              </button>
            )}
          </div>

          {/* Hero Image */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-600">Hero Image <span className="text-gray-400 font-normal">800×800 px</span></p>
            {heroImagePreview || heroImageUrl ? (
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                <Image
                  src={heroImagePreview || heroImageUrl}
                  alt="Course hero image"
                  fill
                  className="object-cover"
                />
                {heroImageUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
                {!heroImageUploading && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-1.5">
                      <Button type="button" size="sm" variant="secondary" className="h-7 text-xs gap-1" onClick={() => heroFileInputRef.current?.click()}>
                        <Upload className="h-3 w-3" /> Change
                      </Button>
                      <Button type="button" size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={removeHeroImage}>
                        <X className="h-3 w-3" /> Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => heroFileInputRef.current?.click()}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 group"
              >
                <div className="p-2.5 rounded-full bg-gray-100 group-hover:bg-primary/10 transition-colors">
                  <ImagePlus className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">Click to upload</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">JPEG, PNG, WebP</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Course Details (JSON / Form toggle) ──── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/[0.08] rounded-lg mt-0.5">
              <Code2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Course Details</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Rich metadata — curriculum, tools, projects, features, etc.
              </p>
            </div>
          </div>
          <div className="flex items-center bg-gray-200 rounded-lg p-1 gap-0.5 shrink-0 ml-4">
            <button
              type="button"
              onClick={switchToJson}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                isJsonMode
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              JSON
            </button>
            <button
              type="button"
              onClick={switchToForm}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                !isJsonMode
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Form
            </button>
          </div>
        </div>

        {isJsonMode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Paste your details JSON. The{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">image</code>{" "}
                field is auto-populated from the upload above.
              </p>
              {jsonError ? (
                <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium shrink-0 ml-4">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {jsonError}
                </span>
              ) : jsonText.trim() ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium shrink-0 ml-4">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Valid JSON
                </span>
              ) : null}
            </div>
            <Textarea
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              rows={30}
              spellCheck={false}
              className={`font-mono text-sm leading-relaxed resize-y bg-gray-950 text-gray-100 border-gray-700 focus-visible:ring-primary/50 ${
                jsonError ? "border-red-500 focus-visible:ring-red-500/30" : ""
              }`}
            />
          </div>
        )}

        {!isJsonMode && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Level</Label>
                <select
                  value={detailsForm.level}
                  onChange={(e) => setDetailsForm((p) => ({ ...p, level: e.target.value }))}
                  className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {["Beginner", "Intermediate", "Advanced", "All Levels"].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Duration</Label>
                <Input
                  placeholder="e.g. 8 Weeks"
                  value={detailsForm.duration}
                  onChange={(e) => setDetailsForm((p) => ({ ...p, duration: e.target.value }))}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Category</Label>
                <Input
                  placeholder="e.g. Data Engineering"
                  value={detailsForm.category}
                  onChange={(e) => setDetailsForm((p) => ({ ...p, category: e.target.value }))}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Subtitle</Label>
              <Input
                placeholder="e.g. Become Job-Ready in Data & Analytics in 6 Weeks"
                value={detailsForm.subtitle}
                onChange={(e) => setDetailsForm((p) => ({ ...p, subtitle: e.target.value }))}
                className="h-11"
              />
            </div>
            <ListFieldEditor
              label="Features / What You'll Learn"
              values={detailsForm.features}
              placeholder="e.g. Focused on real-world data analysis"
              onChange={(vals) => setDetailsForm((p) => ({ ...p, features: vals }))}
              addLabel="Add feature"
            />
            <ListFieldEditor
              label="Requirements / Prerequisites"
              values={detailsForm.requirements}
              placeholder="e.g. No prior coding experience required"
              onChange={(vals) => setDetailsForm((p) => ({ ...p, requirements: vals }))}
              addLabel="Add requirement"
            />
            <p className="text-xs text-gray-400 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
              For rich fields like <strong>curriculum</strong>, <strong>tools</strong>, and <strong>projects</strong>, switch to JSON mode.
            </p>
          </div>
        )}
      </div>
    </EntityForm>
  );
}
