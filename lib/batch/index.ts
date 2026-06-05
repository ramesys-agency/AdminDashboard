import prisma from "@/lib/prisma";
import { BatchStatus } from "@prisma/client";

type PricingRow = { currency: string; amount: number; originalPrice?: number | null };

function pricingToMap(rows: PricingRow[]): Record<string, number> {
  return Object.fromEntries(rows.map((r) => [r.currency, r.amount]));
}

function originalPricingToMap(rows: PricingRow[]): Record<string, number> {
  return Object.fromEntries(
    rows
      .filter((r) => r.originalPrice !== null && r.originalPrice !== undefined)
      .map((r) => [r.currency, r.originalPrice as number])
  );
}

export async function getBatchesByCourseId(courseId: string) {
  const batches = await prisma.courseBatch.findMany({
    where: { courseId },
    include: {
      pricing: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return batches.map((b) => ({
    ...b,
    pricing: pricingToMap(b.pricing),
    originalPricing: originalPricingToMap(b.pricing),
  }));
}

export async function getActiveBatchesByCourseId(courseId: string) {
  const batches = await prisma.courseBatch.findMany({
    where: { courseId, status: "ACTIVE" },
    include: {
      pricing: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return batches.map((b) => ({
    ...b,
    pricing: pricingToMap(b.pricing),
    originalPricing: originalPricingToMap(b.pricing),
  }));
}

export async function getBatchById(id: string) {
  const batch = await prisma.courseBatch.findUnique({
    where: { id },
    include: {
      pricing: true,
      _count: { select: { enrollments: true } },
    },
  });

  if (!batch) return null;
  return {
    ...batch,
    pricing: pricingToMap(batch.pricing),
    originalPricing: originalPricingToMap(batch.pricing),
  };
}

export async function getBatchDetails(id: string) {
  const batch = await prisma.courseBatch.findUnique({
    where: { id },
    include: {
      pricing: true,
      course: { select: { id: true, name: true, slug: true } },
      enrollments: {
        include: {
          student: { select: { id: true, name: true, email: true, phone: true, country: true } },
          payments: {
            select: { id: true, amount: true, currency: true, status: true, method: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!batch) return null;

  const completedPayments = batch.enrollments.flatMap((e) =>
    e.payments.filter((p) => p.status === "COMPLETED")
  );

  const earningsByCurrency: Record<string, number> = {};
  for (const p of completedPayments) {
    const cur = (p.currency ?? "USD").toUpperCase();
    earningsByCurrency[cur] = (earningsByCurrency[cur] ?? 0) + p.amount;
  }

  const durationDays = Math.ceil(
    (new Date(batch.endDate).getTime() - new Date(batch.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    ...batch,
    pricing: pricingToMap(batch.pricing),
    originalPricing: originalPricingToMap(batch.pricing),
    stats: {
      totalEnrolled: batch.enrollments.length,
      seatsLeft: batch.maxSeats != null ? Math.max(0, batch.maxSeats - batch.enrollments.length) : null,
      earningsByCurrency,
      durationDays,
    },
  };
}

export async function createBatch(data: {
  courseId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  maxSeats?: number | null;
  pricing?: { currency: string; amount: number; originalPrice?: number | null }[];
  status?: BatchStatus;
  whatsappGroupUrl?: string | null;
}) {
  const { pricing = [], ...rest } = data;
  return prisma.courseBatch.create({
    data: {
      ...rest,
      pricing: {
        createMany: { data: pricing },
      },
    },
    include: { pricing: true },
  });
}

export async function updateBatch(
  id: string,
  data: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    maxSeats?: number | null;
    pricing?: { currency: string; amount: number; originalPrice?: number | null }[];
    status?: BatchStatus;
    whatsappGroupUrl?: string | null;
  }
) {
  const { pricing, ...rest } = data;

  if (pricing !== undefined) {
    await prisma.batchPricing.deleteMany({ where: { batchId: id } });
  }

  return prisma.courseBatch.update({
    where: { id },
    data: {
      ...rest,
      ...(pricing !== undefined && {
        pricing: { createMany: { data: pricing } },
      }),
    },
    include: { pricing: true },
  });
}

export async function deleteBatch(id: string) {
  return prisma.courseBatch.delete({ where: { id } });
}
