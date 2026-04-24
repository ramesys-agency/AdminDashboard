import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type GetCoursesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getCourses({ page = 1, limit = 10, search }: GetCoursesParams = {}) {
  const skip = (page - 1) * limit;

  // Since Prisma client is stale and missing slug/details, we use queryRaw
  const courses = await prisma.$queryRaw`
    SELECT c.*, 
    (SELECT COUNT(*)::int FROM "CourseEnrollment" ce WHERE ce."courseId" = c.id) as enrollment_count
    FROM "Course" c
    JOIN "Business" b ON c."businessId" = b.id
    WHERE b.type = 'COURSE_SELLING'
    ${search ? Prisma.sql`AND (c.name ILIKE ${`%${search}%`} OR c.description ILIKE ${`%${search}%`})` : Prisma.sql``}
    ORDER BY c."createdAt" DESC
    LIMIT ${limit} OFFSET ${skip}
  `;

  const totalResult = await prisma.$queryRaw`
    SELECT COUNT(*)::int as count 
    FROM "Course" c
    JOIN "Business" b ON c."businessId" = b.id
    WHERE b.type = 'COURSE_SELLING'
    ${search ? Prisma.sql`AND (c.name ILIKE ${`%${search}%`} OR c.description ILIKE ${`%${search}%`})` : Prisma.sql``}
  ` as any[];

  const total = totalResult[0]?.count || 0;

  return {
    data: (courses as any[]).map(c => ({
      ...c,
      _count: { enrollments: c.enrollment_count }
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
  const result = await prisma.$queryRaw`SELECT * FROM "Course" WHERE slug ILIKE ${slug} LIMIT 1`;
  const courses = result as any[];
  return courses.length > 0 ? courses[0] : null;
}

export async function getCourseById(id: string) {
  const result = await prisma.$queryRaw`SELECT * FROM "Course" WHERE id = ${id} LIMIT 1`;
  const courses = result as any[];
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
      courseEnrollmentId: { in: enrollments.map(e => e.id) },
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

export async function createCourse(data: { name: string; description?: string | null; price: number }) {
  const vydhra = await prisma.business.findFirst({
    where: { type: "COURSE_SELLING" },
    select: { id: true },
  });

  if (!vydhra) throw new Error("Vydhra business not found");

  return prisma.course.create({
    data: {
      ...data,
      businessId: vydhra.id,
    },
  });
}
