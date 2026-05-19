import prisma from "@/lib/prisma";

export type GetCoursesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

type PricingRow = { currency: string; amount: number };

function pricingToMap(rows: PricingRow[]): Record<string, number> {
  return Object.fromEntries(rows.map((r) => [r.currency, r.amount]));
}

export async function getCourses({ page = 1, limit = 10, search }: GetCoursesParams = {}) {
  const skip = (page - 1) * limit;

  const vydhra = await prisma.business.findFirst({
    where: { type: "COURSE_SELLING" },
    select: { id: true },
  });

  const businessId = vydhra?.id;

  const where = {
    ...(businessId && { businessId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [total, courses] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      include: {
        pricing: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    data: courses.map((c) => ({
      ...c,
      pricing: pricingToMap(c.pricing),
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
  const course = await prisma.course.findFirst({
    where: { slug: { equals: slug, mode: "insensitive" } },
    include: { pricing: true },
  });

  if (!course) return null;

  const batches = await prisma.courseBatch.findMany({
    where: { courseId: course.id, status: { in: ["ACTIVE", "UPCOMING"] } },
    include: {
      pricing: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return {
    ...course,
    pricing: pricingToMap(course.pricing),
    batches: batches.map((b) => ({
      id: b.id,
      name: b.name,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      maxSeats: b.maxSeats,
      pricing: pricingToMap(b.pricing),
      status: b.status,
      enrollmentCount: b._count.enrollments,
    })),
  };
}

export async function getCourseById(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: { pricing: true },
  });

  if (!course) return null;

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { courseId: id },
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });

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
    pricing: pricingToMap(course.pricing),
    enrollments,
    stats: { totalEnrollments: enrollments.length, totalRevenue },
  };
}

export async function updateCourse(
  id: string,
  data: {
    name: string;
    description?: string | null;
    pricing: { currency: string; amount: number }[];
    details?: Record<string, unknown> | null;
  }
) {
  await prisma.coursePricing.deleteMany({ where: { courseId: id } });

  return prisma.course.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      details: data.details ?? undefined,
      pricing: {
        createMany: { data: data.pricing.map((p) => ({ currency: p.currency, amount: p.amount })) },
      },
    },
    include: { pricing: true },
  });
}

export async function createCourse(data: {
  name: string;
  description?: string | null;
  pricing: { currency: string; amount: number }[];
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

  const existing = await prisma.course.findUnique({ where: { slug: baseSlug } });
  const slug = existing ? `${baseSlug}-${Math.random().toString(36).slice(2, 6)}` : baseSlug;

  return prisma.course.create({
    data: {
      name: data.name,
      description: data.description,
      details: data.details ?? undefined,
      businessId: vydhra.id,
      slug,
      pricing: {
        createMany: { data: data.pricing.map((p) => ({ currency: p.currency, amount: p.amount })) },
      },
    },
    include: { pricing: true },
  });
}
