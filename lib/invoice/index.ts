import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type GetInvoicesParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  projectId?: string;
  businessType?: "IT_SERVICES" | "COURSE_SELLING";
};

export async function getInvoices({ 
  page = 1, 
  limit = 10, 
  search, 
  status,
  projectId,
  businessType = "COURSE_SELLING" 
}: GetInvoicesParams = {}) {
  const skip = (page - 1) * limit;

  const where: Prisma.InvoiceWhereInput = {
    business: { type: businessType },
    ...(status && status !== "all" && { status }),
    ...(projectId && { projectId }),
    ...(search && {
      OR: [
        { id: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [total, data] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        payments: {
          take: 1,
          select: {
            student: { select: { name: true } },
            courseEnrollment: {
              select: {
                course: { select: { name: true } }
              }
            }
          }
        }
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

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      business: true,
      project: {
        include: {
          client: true,
        },
      },
      payments: {
        include: {
          student: true,
          courseEnrollment: {
            include: {
              course: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
