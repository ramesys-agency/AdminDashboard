import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type GetAgentsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getAgents({ page = 1, limit = 10, search }: GetAgentsParams = {}) {
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

export async function updateAgentStatistics(id: string, data: { 
  totalPaid?: { increment: number }, 
  additionalAmount?: number,
  totalEarned?: { increment: number }
}) {
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

export async function incrementAgentEarnings(agentId: string, paymentAmount: number) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { commissionType: true, commissionValue: true },
  });

  if (!agent) return;

  const commission = agent.commissionType === "PERCENTAGE" 
    ? (paymentAmount * (agent.commissionValue || 0)) / 100 
    : (agent.commissionValue || 0);

  return prisma.agent.update({
    where: { id: agentId },
    data: {
      totalEarned: { increment: commission }
    }
  });
}
