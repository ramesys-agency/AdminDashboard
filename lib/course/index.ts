import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type GetCoursesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

type RawCourse = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  price: number;
  currency: string;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
  enrollment_count?: number;
};

export async function getCourses({
  page = 1,
  limit = 10,
  search,
}: GetCoursesParams = {}) {
  const skip = (page - 1) * limit;

  // Since Prisma client is stale and missing slug/details, we use queryRaw
  const courses = (await prisma.$queryRaw`
    SELECT c.*, 
    (SELECT COUNT(*)::int FROM "CourseEnrollment" ce WHERE ce."courseId" = c.id) as enrollment_count
    FROM "Course" c
    JOIN "Business" b ON c."businessId" = b.id
    WHERE b.type = 'COURSE_SELLING'
    ${search ? Prisma.sql`AND (c.name ILIKE ${`%${search}%`} OR c.description ILIKE ${`%${search}%`})` : Prisma.sql``}
    ORDER BY c."createdAt" DESC
    LIMIT ${limit} OFFSET ${skip}
  `) as RawCourse[];

  const totalResult = (await prisma.$queryRaw`
    SELECT COUNT(*)::int as count 
    FROM "Course" c
    JOIN "Business" b ON c."businessId" = b.id
    WHERE b.type = 'COURSE_SELLING'
    ${search ? Prisma.sql`AND (c.name ILIKE ${`%${search}%`} OR c.description ILIKE ${`%${search}%`})` : Prisma.sql``}
  `) as { count: number }[];

  const total = totalResult[0]?.count || 0;

  return {
    data: courses.map((c) => ({
      ...c,
      _count: { enrollments: c.enrollment_count },
    })),
    metadata: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getCourseBySlug(slug: string) {
  const result =
    await prisma.$queryRaw`SELECT * FROM "Course" WHERE slug ILIKE ${slug} LIMIT 1`;
  const courses = result as RawCourse[];
  const course = courses.length > 0 ? courses[0] : null;
  if (!course) return null;

  const batches = await prisma.courseBatch.findMany({
    where: { courseId: course.id, status: { in: ["ACTIVE", "UPCOMING"] } },
    include: { _count: { select: { enrollments: true } } },
    orderBy: { startDate: "asc" },
  });

  return {
    ...course,
    batches: batches.map((b) => ({
      id: b.id,
      name: b.name,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      maxSeats: b.maxSeats,
      price: b.price,
      priceINR: b.priceINR,
      priceUSD: b.priceUSD,
      status: b.status,
      enrollmentCount: b._count.enrollments,
    })),
  };
}

export async function getCourseById(id: string) {
  const result =
    await prisma.$queryRaw`SELECT * FROM "Course" WHERE id = ${id} LIMIT 1`;
  const courses = result as RawCourse[];
  const course = courses.length > 0 ? courses[0] : null;

  if (!course) return null;

  // Include enrollments (still using standard Prisma for now as it doesn't use the new fields)
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { courseId: id },
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });

  // Calculate total revenue for this course
  // Note: Since Payments aren't directly linked to Course, we use courseEnrollmentId in Payment if available
  const payments = await prisma.payment.findMany({
    where: {
      courseEnrollmentId: { in: enrollments.map((e) => e.id) },
      status: "COMPLETED",
    },
    select: { amount: true },
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    ...course,
    enrollments,
    stats: {
      totalEnrollments: enrollments.length,
      totalRevenue,
    },
  };
}

export async function updateCourse(
  id: string,
  data: {
    name: string;
    description?: string | null;
    price: number;
    priceINR?: number | null;
    priceUSD?: number | null;
    details?: Record<string, unknown> | null;
  }
) {
  return prisma.course.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      priceINR: data.priceINR ?? null,
      priceUSD: data.priceUSD ?? null,
      details: data.details ?? undefined,
    },
  });
}

export async function createCourse(data: {
  name: string;
  description?: string | null;
  price: number;
  priceINR?: number | null;
  priceUSD?: number | null;
  details?: Record<string, unknown> | null;
}) {
  const vydhra = await prisma.business.findFirst({
    where: { type: "COURSE_SELLING" },
    select: { id: true },
  });

  if (!vydhra) throw new Error("Vydhra business not found");

  const baseSlug = data.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

  // Ensure slug uniqueness by appending a short random suffix if needed
  const existing = await prisma.course.findUnique({ where: { slug: baseSlug } });
  const slug = existing
    ? `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
    : baseSlug;

  return prisma.course.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      priceINR: data.priceINR ?? null,
      priceUSD: data.priceUSD ?? null,
      details: data.details ?? undefined,
      businessId: vydhra.id,
      slug,
    },
  });
}
