import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type GetPaymentsParams = {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  projectId?: string;
  invoiceId?: string;
};

export async function getPayments({
  page = 1,
  limit = 10,
  status,
  method,
  projectId,
  invoiceId,
}: GetPaymentsParams = {}) {
  const skip = (page - 1) * limit;

  const where: Prisma.PaymentWhereInput = {
    business: { type: "IT_SERVICES" },
    ...(status && { status }),
    ...(method && { method }),
    ...(projectId && { projectId }),
    ...(invoiceId && { invoiceId }),
  };

  const [total, data] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: { project: true, invoice: true },
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

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      project: true,
      invoice: true,
      agent: true,
      coupon: true,
      student: true,
    },
  });
}
