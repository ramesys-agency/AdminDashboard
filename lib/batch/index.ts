import prisma from "@/lib/prisma";
import { BatchStatus } from "@prisma/client";

export async function getBatchesByCourseId(courseId: string) {
  return prisma.courseBatch.findMany({
    where: { courseId },
    include: {
      _count: { select: { enrollments: true } },
    },
    orderBy: { startDate: "asc" },
  });
}

export async function getActiveBatchesByCourseId(courseId: string) {
  return prisma.courseBatch.findMany({
    where: { courseId, status: "ACTIVE" },
    include: {
      _count: { select: { enrollments: true } },
    },
    orderBy: { startDate: "asc" },
  });
}

export async function getBatchById(id: string) {
  return prisma.courseBatch.findUnique({
    where: { id },
    include: {
      _count: { select: { enrollments: true } },
    },
  });
}

export async function createBatch(data: {
  courseId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  maxSeats?: number | null;
  price?: number | null;
  priceINR?: number | null;
  priceUSD?: number | null;
  status?: BatchStatus;
}) {
  return prisma.courseBatch.create({ data });
}

export async function updateBatch(
  id: string,
  data: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    maxSeats?: number | null;
    price?: number | null;
    priceINR?: number | null;
    priceUSD?: number | null;
    status?: BatchStatus;
  }
) {
  return prisma.courseBatch.update({ where: { id }, data });
}

export async function deleteBatch(id: string) {
  return prisma.courseBatch.delete({ where: { id } });
}
