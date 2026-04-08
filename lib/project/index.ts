import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type GetProjectsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  clientId?: string;
};

export async function getProjects({
  page = 1,
  limit = 10,
  search,
  status,
  clientId,
}: GetProjectsParams = {}) {
  const skip = (page - 1) * limit;

  const where: Prisma.ProjectWhereInput = {
    business: { type: "IT_SERVICES" },
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [total, data] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: { client: true },
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

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      payments: {
        orderBy: { createdAt: "desc" },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
