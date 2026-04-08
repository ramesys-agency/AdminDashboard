import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type GetClientsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getClients({ page = 1, limit = 10, search }: GetClientsParams = {}) {
  const skip = (page - 1) * limit;

  const where: Prisma.ClientWhereInput = {
    business: { type: "IT_SERVICES" },
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [total, data] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      include: { _count: { select: { projects: true } } },
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

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        include: {
          payments: {
            orderBy: { createdAt: "desc" },
          },
          invoices: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
