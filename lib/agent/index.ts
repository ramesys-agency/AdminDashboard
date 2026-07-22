import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getReferralSettings, isCodeTaken, EarningCreditOptions } from "@/lib/referral";
import { getVydhraBusinessId } from "@/lib/business";

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
 * Writes a CommissionCredit ledger row (when `opts.paymentId` is provided)
 * and increments the derived `totalEarned` aggregate in the same client/tx.
 * Returns the credit details so callers can notify the agent.
 */
export async function incrementAgentEarnings(
  agentId: string,
  paymentAmount: number,
  opts: EarningCreditOptions = {},
) {
  const db = opts.tx ?? prisma;
  const agent = await db.agent.findUnique({
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

  if (opts.paymentId) {
    // Ledger row first — @@unique(paymentId, agentId) doubles as an
    // idempotency guard against double-crediting the same payment.
    await db.commissionCredit.create({
      data: {
        paymentId: opts.paymentId,
        agentId,
        rateType: agent.commissionType,
        rateValue: agent.commissionValue || 0,
        saleAmountUsd: paymentAmount,
        amountUsd: commission,
      },
    });
  }

  const updated = await db.agent.update({
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
  const businessId = await getVydhraBusinessId();

  // Codes share one namespace with coupons and student referral codes, and
  // checkout resolves coupons first — reusing a student's code would silently
  // shadow it forever. Reject up front with a clear message.
  const code = data.code.toUpperCase().trim();
  if (await isCodeTaken(code)) {
    throw new Error(
      `Code "${code}" is already in use by an agent, coupon, or student referral code`,
    );
  }

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
        code,
        commissionType,
        commissionValue,
        businessId,
      },
    });

    // Create a corresponding Coupon with per-currency discounts (defaults to USD)
    await tx.coupon.create({
      data: {
        code,
        businessId,
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
