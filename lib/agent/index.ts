import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getReferralSettings } from "@/lib/referral";

export type GetAgentsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getAgents({
  page = 1,
  limit = 10,
  search,
}: GetAgentsParams = {}) {
  const skip = (page - 1) * limit;

  const vydhra = await prisma.business.findFirst({
    where: { type: "COURSE_SELLING" },
    select: { id: true },
  });

  if (!vydhra) {
    return {
      data: [],
      metadata: { total: 0, page, limit, pages: 0 },
    };
  }

  const where: Prisma.AgentWhereInput = {
    businessId: vydhra.id,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [total, data] = await Promise.all([
    prisma.agent.count({ where }),
    prisma.agent.findMany({
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

export async function getAgentById(id: string) {
  return prisma.agent.findUnique({
    where: { id },
    include: {
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

export async function updateAgentStatistics(
  id: string,
  data: {
    totalPaid?: { increment: number };
    additionalAmount?: number;
    totalEarned?: { increment: number };
  },
) {
  const agent = await prisma.agent.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!agent) throw new Error("Agent not found");

  return prisma.agent.update({
    where: { id },
    data,
  });
}

/**
 * Credits commission for a completed payment (paymentAmount in USD).
 * Returns the credit details so callers can notify the agent.
 */
export async function incrementAgentEarnings(
  agentId: string,
  paymentAmount: number,
) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      name: true,
      email: true,
      code: true,
      commissionType: true,
      commissionValue: true,
    },
  });
  if (!agent) return null;

  const commission =
    agent.commissionType === "PERCENTAGE"
      ? (paymentAmount * (agent.commissionValue || 0)) / 100
      : agent.commissionValue || 0;

  const updated = await prisma.agent.update({
    where: { id: agentId },
    data: {
      totalEarned: { increment: commission },
    },
    select: { totalEarned: true },
  });

  return {
    commission,
    totalEarned: updated.totalEarned,
    name: agent.name,
    email: agent.email,
    code: agent.code,
  };
}

export async function createAgent(data: {
  name: string;
  email: string;
  phone?: string | null;
  code: string;
  commissionType?: "PERCENTAGE" | "FLAT";
  commissionValue?: number;
  discountType?: "PERCENTAGE" | "FLAT";
  discountValue?: number;
}) {
  const vydhra = await prisma.business.findFirst({
    where: { type: "COURSE_SELLING" },
    select: { id: true },
  });

  if (!vydhra) throw new Error("Vydhra business not found");

  // Fall back to the configured agent defaults for anything not provided
  const settings = await getReferralSettings();

  const commissionType = data.commissionType ?? settings.agentCommissionType;
  const commissionValue = data.commissionValue ?? settings.agentCommissionValue;
  const discountType = data.discountType ?? settings.agentDiscountType;
  const discountValue = data.discountValue ?? settings.agentDiscountValue;

  return prisma.$transaction(async (tx) => {
    // Create the Agent
    const agent = await tx.agent.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        code: data.code,
        commissionType,
        commissionValue,
        businessId: vydhra.id,
      },
    });

    // Create a corresponding Coupon with per-currency discounts (defaults to USD)
    await tx.coupon.create({
      data: {
        code: data.code,
        businessId: vydhra.id,
        discounts: {
          create: {
            currency: "USD",
            discountType,
            discountValue,
          },
        },
      },
    });

    return agent;
  });
}
