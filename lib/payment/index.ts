import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type GetPaymentsParams = {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
};

export async function getPayments({ page = 1, limit = 10, status, method }: GetPaymentsParams = {}) {
  const skip = (page - 1) * limit;

  const where: Prisma.PaymentWhereInput = {
    business: { type: "COURSE_SELLING" },
    ...(status && status !== "all" && { status }),
    ...(method && method !== "all" && { method }),
  };

  const [total, data] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: {
        student: { select: { name: true, email: true } },
        project: { select: { name: true } },
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

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      student: true,
      project: true,
      agent: true,
      coupon: true,
      invoice: true,
    },
  });
}

import { incrementAgentEarnings } from "@/lib/agent";

export async function updatePaymentStatus(id: string, status: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    select: { agentId: true, amount: true, status: true }
  });

  if (!payment) throw new Error("Payment not found");

  // If status is being changed to COMPLETED and it was not COMPLETED before
  if (status === "COMPLETED" && payment.status !== "COMPLETED" && payment.agentId) {
    await incrementAgentEarnings(payment.agentId, payment.amount);
  }

  return prisma.payment.update({
    where: { id },
    data: { status }
  });
}
