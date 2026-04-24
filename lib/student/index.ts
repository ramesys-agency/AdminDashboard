import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type GetStudentsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getStudents({ page = 1, limit = 10, search }: GetStudentsParams = {}) {
  const skip = (page - 1) * limit;

  const where: Prisma.StudentWhereInput = {
    business: { type: "COURSE_SELLING" },
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [total, data] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({
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

export async function getStudentById(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          course: true,
        },
        orderBy: { createdAt: "desc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
export async function upsertStudent(data: {
  name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
}) {
  const vydhra = await prisma.business.findFirst({
    where: { type: "COURSE_SELLING" },
    select: { id: true },
  });

  if (!vydhra) throw new Error("Vydhra business not found");

  // Try to find existing student by email
  const existing = await prisma.student.findUnique({ where: { email: data.email } });
  if (existing) {
    // Update name/phone/country if provided
    return prisma.student.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        phone: data.phone ?? existing.phone,
        country: data.country ?? existing.country,
      },
    });
  }

  return prisma.student.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      country: data.country ?? null,
      businessId: vydhra.id,
    },
  });
}

export async function createEnrollment(studentId: string, courseId: string) {
  return prisma.courseEnrollment.create({
    data: {
      studentId,
      courseId,
      status: "ACTIVE",
    },
  });
}

export async function createStudent(data: { name: string; email: string; phone?: string | null }) {
  const vydhra = await prisma.business.findFirst({
    where: { type: "COURSE_SELLING" },
    select: { id: true },
  });

  if (!vydhra) throw new Error("Vydhra business not found");

  return prisma.student.create({
    data: {
      ...data,
      businessId: vydhra.id,
    },
  });
}
