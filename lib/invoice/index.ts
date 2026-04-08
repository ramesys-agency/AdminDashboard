import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type GetInvoicesParams = {
  page?: number;
  limit?: number;
  status?: string;
  projectId?: string;
};

export async function getInvoices({
  page = 1,
  limit = 10,
  status,
  projectId,
}: GetInvoicesParams = {}) {
  const skip = (page - 1) * limit;

  const where: Prisma.InvoiceWhereInput = {
    business: { type: "IT_SERVICES" },
    ...(status && { status }),
    ...(projectId && { projectId }),
  };

  const [total, data] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      include: { project: true },
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
      project: true,
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
