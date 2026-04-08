import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type GetCoursesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getCourses({ page = 1, limit = 10, search }: GetCoursesParams = {}) {
  const skip = (page - 1) * limit;

  const where: Prisma.CourseWhereInput = {
    business: { type: "COURSE_SELLING" },
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [total, data] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      include: {
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    data,
    metadata: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getCourseById(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          student: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!course) return null;

  // Calculate total revenue for this course
  // Note: Since Payments aren't directly linked to Course, we use courseEnrollmentId in Payment if available
  const payments = await prisma.payment.findMany({
    where: {
      courseEnrollmentId: { in: course.enrollments.map(e => e.id) },
      status: "COMPLETED",
    },
    select: { amount: true },
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    ...course,
    stats: {
      totalEnrollments: course.enrollments.length,
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
