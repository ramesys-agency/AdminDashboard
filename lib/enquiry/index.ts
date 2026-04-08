import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type GetEnquiriesParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export async function getEnquiries({ page = 1, limit = 10, search, status }: GetEnquiriesParams = {}) {
  const skip = (page - 1) * limit;

  const where: Prisma.EnquiryWhereInput = {
    business: { type: "COURSE_SELLING" },
    ...(status && status !== "all" && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [total, data] = await Promise.all([
    prisma.enquiry.count({ where }),
    prisma.enquiry.findMany({
      where,
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

export async function getEnquiryById(id: string) {
  return prisma.enquiry.findUnique({
    where: { id },
  });
}
